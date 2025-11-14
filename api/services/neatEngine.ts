import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs';

export interface NeuralArchitecture {
  layers: NeuralLayer[];
  connections: ConnectionGene[];
  activationFunctions: string[];
  learningRate: number;
  optimizer: string;
  lossFunction: string;
}

export interface NeuralLayer {
  id: string;
  type: 'input' | 'hidden' | 'output';
  units: number;
  activation: string;
  dropout: number;
  batchNormalization: boolean;
}

export interface ConnectionGene {
  from: string;
  to: string;
  weight: number;
  enabled: boolean;
  innovation: number;
}

export interface Genome {
  id: string;
  architecture: NeuralArchitecture;
  fitness: number;
  species: number;
  age: number;
  adjustedFitness: number;
  historicalMarkers: number[];
}

export interface NEATConfiguration {
  populationSize: number;
  inputSize: number;
  outputSize: number;
  maxHiddenLayers: number;
  maxUnitsPerLayer: number;
  mutationRates: {
    addNode: number;
    addConnection: number;
    removeNode: number;
    removeConnection: number;
    mutateWeights: number;
    mutateActivation: number;
    mutateLearningRate: number;
  };
  compatibility: {
    c1: number; // excess coefficient
    c2: number; // disjoint coefficient
    c3: number; // weight difference coefficient
    threshold: number;
  };
  stagnation: {
    maxStagnation: number;
    survivalThreshold: number;
  };
  elitism: number;
}

export interface Species {
  id: number;
  representative: Genome;
  members: Genome[];
  bestFitness: number;
  stagnation: number;
  age: number;
}

export class NEATEngine extends EventEmitter {
  private configuration: NEATConfiguration;
  private population: Genome[] = [];
  private species: Species[] = [];
  private generation = 0;
  private innovationNumber = 0;
  private bestGenome: Genome | null = null;
  private isRunning = false;
  private currentModel: tf.LayersModel | null = null;

  private readonly activationFunctions = [
    'relu', 'sigmoid', 'tanh', 'elu', 'selu', 'softmax', 'linear'
  ];

  private readonly optimizers = ['adam', 'sgd', 'rmsprop', 'adagrad'];
  private readonly lossFunctions = ['categoricalCrossentropy', 'binaryCrossentropy', 'mse'];

  constructor(configuration?: Partial<NEATConfiguration>) {
    super();
    
    this.configuration = {
      populationSize: 50,
      inputSize: 784,
      outputSize: 10,
      maxHiddenLayers: 5,
      maxUnitsPerLayer: 512,
      mutationRates: {
        addNode: 0.03,
        addConnection: 0.05,
        removeNode: 0.02,
        removeConnection: 0.02,
        mutateWeights: 0.8,
        mutateActivation: 0.1,
        mutateLearningRate: 0.1
      },
      compatibility: {
        c1: 1.0,
        c2: 1.0,
        c3: 0.4,
        threshold: 3.0
      },
      stagnation: {
        maxStagnation: 15,
        survivalThreshold: 0.2
      },
      elitism: 0.2
    };

    if (configuration) {
      this.configuration = { ...this.configuration, ...configuration };
    }

    this.initializePopulation();
  }

  private initializePopulation(): void {
    this.population = [];
    this.species = [];
    this.generation = 0;
    this.innovationNumber = 0;

    // 创建初始种群
    for (let i = 0; i < this.configuration.populationSize; i++) {
      const genome = this.createMinimalGenome();
      genome.id = `genome_${i}_${Date.now()}`;
      genome.fitness = 0;
      genome.species = 0;
      genome.age = 0;
      genome.adjustedFitness = 0;
      this.population.push(genome);
    }

    this.speciatePopulation();
  }

  private createMinimalGenome(): Genome {
    const layers: NeuralLayer[] = [
      {
        id: 'input',
        type: 'input',
        units: this.configuration.inputSize,
        activation: 'linear',
        dropout: 0,
        batchNormalization: false
      },
      {
        id: 'output',
        type: 'output',
        units: this.configuration.outputSize,
        activation: 'softmax',
        dropout: 0,
        batchNormalization: false
      }
    ];

    const connections: ConnectionGene[] = [];
    
    // 创建初始连接（全连接）
    for (let i = 0; i < this.configuration.inputSize; i++) {
      for (let j = 0; j < this.configuration.outputSize; j++) {
        connections.push({
          from: `input_${i}`,
          to: `output_${j}`,
          weight: (Math.random() - 0.5) * 2,
          enabled: true,
          innovation: this.innovationNumber++
        });
      }
    }

    return {
      id: '',
      architecture: {
        layers,
        connections,
        activationFunctions: ['linear', 'softmax'],
        learningRate: 0.001,
        optimizer: 'adam',
        lossFunction: 'categoricalCrossentropy'
      },
      fitness: 0,
      species: 0,
      age: 0,
      adjustedFitness: 0,
      historicalMarkers: []
    };
  }

  public async startEvolution(): Promise<void> {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.emit('neat-started', { generation: this.generation });
    
    // 开始进化循环
    await this.evolveGeneration();
  }

  public stopEvolution(): void {
    this.isRunning = false;
    this.emit('neat-stopped', { generation: this.generation });
  }

  private async evolveGeneration(): Promise<void> {
    if (!this.isRunning) return;

    this.emit('generation-started', { generation: this.generation });

    // 评估所有个体
    await this.evaluatePopulation();

    // 计算适应度统计
    this.calculateFitnessStatistics();

    // 物种形成
    this.speciatePopulation();

    // 移除停滞的物种
    this.removeStagnantSpecies();

    // 选择繁殖
    const newPopulation = this.createNextGeneration();

    // 更新种群
    this.population = newPopulation;
    this.generation++;

    // 找到最优个体
    this.updateBestGenome();

    this.emit('generation-completed', {
      generation: this.generation,
      bestFitness: this.bestGenome?.fitness || 0,
      avgFitness: this.getAverageFitness(),
      speciesCount: this.species.length
    });

    // 继续下一代
    if (this.isRunning) {
      setTimeout(() => this.evolveGeneration(), 1000);
    }
  }

  private async evaluatePopulation(): Promise<void> {
    const evaluationPromises = this.population.map(async (genome) => {
      try {
        const fitness = await this.evaluateGenome(genome);
        genome.fitness = fitness;
        genome.age++;
      } catch (error) {
        genome.fitness = 0;
        this.emit('evaluation-error', { genome: genome.id, error });
      }
    });

    await Promise.all(evaluationPromises);
  }

  private async evaluateGenome(genome: Genome): Promise<number> {
    try {
      // 构建TensorFlow模型
      const model = this.buildModel(genome);
      
      // 这里应该使用实际的训练数据和验证数据
      // 现在使用模拟的适应度评估
      const complexityPenalty = this.calculateComplexityPenalty(genome);
      const accuracyScore = await this.simulateAccuracy(model);
      
      // 清理模型
      model.dispose();

      return Math.max(0, accuracyScore - complexityPenalty);
    } catch (error) {
      return 0;
    }
  }

  private buildModel(genome: Genome): tf.LayersModel {
    const model = tf.sequential();
    
    // 构建层
    genome.architecture.layers.forEach((layer, index) => {
      if (layer.type === 'input') return;
      
      const layerConfig: any = {
        units: layer.units,
        activation: layer.activation,
        inputShape: index === 1 ? [this.configuration.inputSize] : undefined
      };

      if (layer.dropout > 0) {
        model.add(tf.layers.dropout({ rate: layer.dropout }));
      }

      if (layer.batchNormalization) {
        model.add(tf.layers.batchNormalization());
      }

      model.add(tf.layers.dense(layerConfig));
    });

    // 编译模型
    model.compile({
      optimizer: genome.architecture.optimizer,
      loss: genome.architecture.lossFunction,
      metrics: ['accuracy']
    });

    return model;
  }

  private calculateComplexityPenalty(genome: Genome): number {
    const layerCount = genome.architecture.layers.length;
    const connectionCount = genome.architecture.connections.filter(c => c.enabled).length;
    const totalUnits = genome.architecture.layers.reduce((sum, layer) => sum + layer.units, 0);
    
    // 复杂度惩罚（防止过复杂的结构）
    const penalty = (layerCount * 0.01) + (connectionCount * 0.001) + (totalUnits * 0.0001);
    return Math.min(0.3, penalty);
  }

  private async simulateAccuracy(model: tf.LayersModel): Promise<number> {
    // 模拟准确性评估
    // 在实际应用中，这里应该使用真实的验证数据
    return 0.7 + Math.random() * 0.3;
  }

  private calculateFitnessStatistics(): void {
    let totalFitness = 0;
    let maxFitness = 0;

    this.population.forEach(genome => {
      totalFitness += genome.fitness;
      maxFitness = Math.max(maxFitness, genome.fitness);
    });

    const avgFitness = totalFitness / this.population.length;

    // 计算调整后的适应度（考虑物种共享）
    this.population.forEach(genome => {
      const species = this.species.find(s => s.id === genome.species);
      if (species) {
        genome.adjustedFitness = genome.fitness / species.members.length;
      }
    });

    this.emit('fitness-statistics', {
      generation: this.generation,
      maxFitness,
      avgFitness,
      minFitness: Math.min(...this.population.map(g => g.fitness))
    });
  }

  private speciatePopulation(): void {
    // 清除现有物种
    this.species.forEach(species => {
      species.members = [];
    });

    // 为每个个体分配物种
    this.population.forEach(genome => {
      let foundSpecies = false;

      for (const species of this.species) {
        if (this.getCompatibilityDistance(genome, species.representative) < this.configuration.compatibility.threshold) {
          species.members.push(genome);
          genome.species = species.id;
          foundSpecies = true;
          break;
        }
      }

      if (!foundSpecies) {
        // 创建新物种
        const newSpecies: Species = {
          id: this.species.length,
          representative: genome,
          members: [genome],
          bestFitness: genome.fitness,
          stagnation: 0,
          age: 0
        };

        this.species.push(newSpecies);
        genome.species = newSpecies.id;
      }
    });

    // 移除空物种
    this.species = this.species.filter(species => species.members.length > 0);
  }

  private getCompatibilityDistance(genome1: Genome, genome2: Genome): number {
    const connections1 = genome1.architecture.connections;
    const connections2 = genome2.architecture.connections;

    let excess = 0;
    let disjoint = 0;
    let weightDiff = 0;
    let matching = 0;

    const maxInnovation1 = Math.max(...connections1.map(c => c.innovation));
    const maxInnovation2 = Math.max(...connections2.map(c => c.innovation));
    const maxInnovation = Math.max(maxInnovation1, maxInnovation2);

    for (let i = 0; i <= maxInnovation; i++) {
      const conn1 = connections1.find(c => c.innovation === i);
      const conn2 = connections2.find(c => c.innovation === i);

      if (conn1 && conn2) {
        matching++;
        weightDiff += Math.abs(conn1.weight - conn2.weight);
      } else if (conn1 || conn2) {
        if (i <= Math.min(maxInnovation1, maxInnovation2)) {
          disjoint++;
        } else {
          excess++;
        }
      }
    }

    const N = Math.max(connections1.length, connections2.length);
    const avgWeightDiff = matching > 0 ? weightDiff / matching : 0;

    return (this.configuration.compatibility.c1 * excess / N) +
           (this.configuration.compatibility.c2 * disjoint / N) +
           (this.configuration.compatibility.c3 * avgWeightDiff);
  }

  private removeStagnantSpecies(): void {
    this.species = this.species.filter(species => {
      const bestFitness = Math.max(...species.members.map(m => m.fitness));
      
      if (bestFitness > species.bestFitness) {
        species.bestFitness = bestFitness;
        species.stagnation = 0;
      } else {
        species.stagnation++;
      }

      return species.stagnation < this.configuration.stagnation.maxStagnation;
    });
  }

  private createNextGeneration(): Genome[] {
    const newPopulation: Genome[] = [];

    // 精英保留
    this.species.forEach(species => {
      const eliteCount = Math.ceil(species.members.length * this.configuration.elitism);
      const sortedMembers = [...species.members].sort((a, b) => b.fitness - a.fitness);
      
      for (let i = 0; i < eliteCount && i < sortedMembers.length; i++) {
        newPopulation.push({ ...sortedMembers[i] });
      }
    });

    // 繁殖新个体
    while (newPopulation.length < this.configuration.populationSize) {
      const parent1 = this.selectParent();
      const parent2 = this.selectParent();
      
      const offspring = this.crossover(parent1, parent2);
      const mutatedOffspring = this.mutate(offspring);
      
      newPopulation.push(mutatedOffspring);
    }

    return newPopulation.slice(0, this.configuration.populationSize);
  }

  private selectParent(): Genome {
    // 锦标赛选择
    const tournamentSize = 3;
    let best = this.population[Math.floor(Math.random() * this.population.length)];

    for (let i = 1; i < tournamentSize; i++) {
      const candidate = this.population[Math.floor(Math.random() * this.population.length)];
      if (candidate.adjustedFitness > best.adjustedFitness) {
        best = candidate;
      }
    }

    return best;
  }

  private crossover(parent1: Genome, parent2: Genome): Genome {
    if (Math.random() < 0.5) {
      return { ...parent1 };
    }

    const offspring: Genome = {
      id: `offspring_${Date.now()}_${Math.random()}`,
      architecture: {
        layers: [],
        connections: [],
        activationFunctions: [],
        learningRate: Math.random() < 0.5 ? parent1.architecture.learningRate : parent2.architecture.learningRate,
        optimizer: Math.random() < 0.5 ? parent1.architecture.optimizer : parent2.architecture.optimizer,
        lossFunction: Math.random() < 0.5 ? parent1.architecture.lossFunction : parent2.architecture.lossFunction
      },
      fitness: 0,
      species: 0,
      age: 0,
      adjustedFitness: 0,
      historicalMarkers: []
    };

    // 交叉层结构
    const layers1 = parent1.architecture.layers;
    const layers2 = parent2.architecture.layers;
    const maxLayers = Math.max(layers1.length, layers2.length);

    for (let i = 0; i < maxLayers; i++) {
      const layer1 = layers1[i];
      const layer2 = layers2[i];
      
      if (layer1 && layer2) {
        offspring.architecture.layers.push({
          ...layer1,
          units: Math.random() < 0.5 ? layer1.units : layer2.units,
          activation: Math.random() < 0.5 ? layer1.activation : layer2.activation,
          dropout: Math.random() < 0.5 ? layer1.dropout : layer2.dropout,
          batchNormalization: Math.random() < 0.5 ? layer1.batchNormalization : layer2.batchNormalization
        });
      } else if (layer1) {
        offspring.architecture.layers.push({ ...layer1 });
      } else if (layer2) {
        offspring.architecture.layers.push({ ...layer2 });
      }
    }

    return offspring;
  }

  private mutate(genome: Genome): Genome {
    const mutated = { ...genome };
    mutated.id = `mutated_${Date.now()}_${Math.random()}`;

    // 结构突变
    if (Math.random() < this.configuration.mutationRates.addNode) {
      this.addNodeMutation(mutated);
    }

    if (Math.random() < this.configuration.mutationRates.addConnection) {
      this.addConnectionMutation(mutated);
    }

    if (Math.random() < this.configuration.mutationRates.removeNode) {
      this.removeNodeMutation(mutated);
    }

    if (Math.random() < this.configuration.mutationRates.removeConnection) {
      this.removeConnectionMutation(mutated);
    }

    // 参数突变
    if (Math.random() < this.configuration.mutationRates.mutateWeights) {
      this.mutateWeights(mutated);
    }

    if (Math.random() < this.configuration.mutationRates.mutateActivation) {
      this.mutateActivation(mutated);
    }

    if (Math.random() < this.configuration.mutationRates.mutateLearningRate) {
      this.mutateLearningRate(mutated);
    }

    return mutated;
  }

  private addNodeMutation(genome: Genome): void {
    // 添加节点突变
    const hiddenLayers = genome.architecture.layers.filter(l => l.type === 'hidden');
    
    if (hiddenLayers.length < this.configuration.maxHiddenLayers) {
      const newLayer: NeuralLayer = {
        id: `hidden_${Date.now()}`,
        type: 'hidden',
        units: Math.floor(Math.random() * this.configuration.maxUnitsPerLayer) + 1,
        activation: this.activationFunctions[Math.floor(Math.random() * this.activationFunctions.length)],
        dropout: Math.random() * 0.5,
        batchNormalization: Math.random() < 0.3
      };

      // 找到插入位置
      const insertIndex = Math.floor(Math.random() * (genome.architecture.layers.length - 1)) + 1;
      genome.architecture.layers.splice(insertIndex, 0, newLayer);
    }
  }

  private addConnectionMutation(genome: Genome): void {
    // 添加连接突变
    const layers = genome.architecture.layers;
    
    if (layers.length > 2) {
      const fromLayer = layers[Math.floor(Math.random() * (layers.length - 1))];
      const toLayer = layers[Math.floor(Math.random() * (layers.length - 1)) + 1];
      
      if (fromLayer.id !== toLayer.id) {
        const newConnection: ConnectionGene = {
          from: fromLayer.id,
          to: toLayer.id,
          weight: (Math.random() - 0.5) * 2,
          enabled: true,
          innovation: this.innovationNumber++
        };
        
        genome.architecture.connections.push(newConnection);
      }
    }
  }

  private removeNodeMutation(genome: Genome): void {
    // 移除节点突变
    const hiddenLayers = genome.architecture.layers.filter(l => l.type === 'hidden');
    
    if (hiddenLayers.length > 0) {
      const layerToRemove = hiddenLayers[Math.floor(Math.random() * hiddenLayers.length)];
      genome.architecture.layers = genome.architecture.layers.filter(l => l.id !== layerToRemove.id);
      genome.architecture.connections = genome.architecture.connections.filter(
        c => c.from !== layerToRemove.id && c.to !== layerToRemove.id
      );
    }
  }

  private removeConnectionMutation(genome: Genome): void {
    // 移除连接突变
    const connections = genome.architecture.connections;
    
    if (connections.length > 1) {
      const indexToRemove = Math.floor(Math.random() * connections.length);
      connections.splice(indexToRemove, 1);
    }
  }

  private mutateWeights(genome: Genome): void {
    // 权重突变
    genome.architecture.connections.forEach(connection => {
      if (Math.random() < 0.1) {
        connection.weight += (Math.random() - 0.5) * 0.5;
      }
    });
  }

  private mutateActivation(genome: Genome): void {
    // 激活函数突变
    genome.architecture.layers.forEach(layer => {
      if (layer.type !== 'input' && Math.random() < 0.1) {
        layer.activation = this.activationFunctions[Math.floor(Math.random() * this.activationFunctions.length)];
      }
    });
  }

  private mutateLearningRate(genome: Genome): void {
    // 学习率突变
    genome.architecture.learningRate *= (0.9 + Math.random() * 0.2);
    genome.architecture.learningRate = Math.max(0.0001, Math.min(0.1, genome.architecture.learningRate));
  }

  private updateBestGenome(): void {
    const currentBest = this.population.reduce((best, genome) => 
      genome.fitness > best.fitness ? genome : best
    );

    if (!this.bestGenome || currentBest.fitness > this.bestGenome.fitness) {
      this.bestGenome = { ...currentBest };
      this.emit('new-best-genome', {
        generation: this.generation,
        genome: this.bestGenome
      });
    }
  }

  public getBestGenome(): Genome | null {
    return this.bestGenome ? { ...this.bestGenome } : null;
  }

  public getPopulation(): Genome[] {
    return this.population.map(g => ({ ...g }));
  }

  private getAverageFitness(): number {
    if (this.population.length === 0) return 0;
    const totalFitness = this.population.reduce((sum, genome) => sum + (genome.fitness || 0), 0);
    return totalFitness / this.population.length;
  }

  public getSpecies(): Species[] {
    return this.species.map(s => ({ ...s }));
  }

  public getGeneration(): number {
    return this.generation;
  }

  public exportTopGenomes(count: number = 5): Genome[] {
    return [...this.population]
      .sort((a, b) => b.fitness - a.fitness)
      .slice(0, count);
  }

  public async buildBestModel(): Promise<tf.LayersModel | null> {
    if (!this.bestGenome) return null;
    return this.buildModel(this.bestGenome);
  }
}