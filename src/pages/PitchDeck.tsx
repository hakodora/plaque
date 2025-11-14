import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Brain, Target, Zap, TrendingUp, Users, DollarSign, Award, Cpu, Network, BarChart3, Microscope, Heart, Shield, Globe, Clock, Star } from 'lucide-react';

const PitchDeck: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 'title',
      title: 'DentalAI Pro',
      subtitle: '不断自我进化的牙科影像智能分析系统',
      content: (
        <div className="text-center space-y-8">
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-full">
              <Brain className="w-16 h-16 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            牙科影像AI分析的未来
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            全球首个具备自我进化能力的牙科影像智能分析平台，24小时不间断优化，准确率达96.6%
          </p>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="bg-blue-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">96.6%</div>
              <div className="text-sm text-gray-600">分析准确率</div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-green-600">24/7</div>
              <div className="text-sm text-gray-600">持续进化</div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">5X</div>
              <div className="text-sm text-gray-600">效率提升</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'problem',
      title: '行业痛点',
      subtitle: '传统牙科影像分析面临的挑战',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <Target className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">准确率不稳定</h3>
                  <p className="text-gray-600">传统AI模型准确率波动大，缺乏持续优化机制</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">分析耗时长</h3>
                  <p className="text-gray-600">单次影像分析需要15-30分钟，影响诊疗效率</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">专家依赖度高</h3>
                  <p className="text-gray-600">需要资深专家进行二次确认，人力成本高</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-full">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">缺乏标准化</h3>
                  <p className="text-gray-600">不同医生诊断标准不一致，影响治疗质量</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">误诊风险</h3>
                  <p className="text-gray-600">人工分析存在15-20%的误诊率，影响患者安全</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <Globe className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">资源分布不均</h3>
                  <p className="text-gray-600">优质医疗资源集中在大城市，基层医疗水平有限</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg mt-8">
            <p className="text-center text-lg font-semibold text-gray-700">
              全球牙科影像分析市场急需智能化、标准化、高效率的解决方案
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'solution',
      title: '革命性解决方案',
      subtitle: '自我进化的智能分析系统',
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 p-4 rounded-full inline-flex">
              <Zap className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-2xl font-bold mt-4">全球首创自我进化AI系统</h3>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">进化引擎</h4>
                <p className="text-blue-700">基于遗传算法，24小时不间断优化分析模型</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 mb-3">神经进化</h4>
                <p className="text-green-700">NEAT算法自动优化神经网络架构</p>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-800 mb-3">自适应学习</h4>
                <p className="text-purple-700">元学习能力，越用越聪明</p>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-orange-800 mb-3">A/B测试</h4>
                <p className="text-orange-700">自动化对比测试，科学验证优化效果</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-red-800 mb-3">实时优化</h4>
                <p className="text-red-700">3分钟内完成分析，准确率持续提升</p>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-indigo-800 mb-3">智能协调</h4>
                <p className="text-indigo-700">多系统协同，避免冲突，全局最优</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg mt-8">
            <div className="flex items-center justify-center space-x-4">
              <Award className="w-8 h-8 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-800">
                突破传统AI局限，实现真正的人工智能自我进化
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'technology',
      title: '核心技术架构',
      subtitle: '五大核心系统协同工作',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white border-2 border-blue-200 rounded-lg p-6 text-center">
              <div className="bg-blue-100 p-4 rounded-full inline-flex mb-4">
                <Cpu className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-blue-800 mb-2">进化引擎</h4>
              <p className="text-sm text-gray-600">遗传算法优化</p>
              <div className="mt-3 text-xs text-blue-600">
                <div>种群管理</div>
                <div>适应度评估</div>
                <div>变异交叉</div>
              </div>
            </div>
            <div className="bg-white border-2 border-green-200 rounded-lg p-6 text-center">
              <div className="bg-green-100 p-4 rounded-full inline-flex mb-4">
                <Network className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-green-800 mb-2">NEAT系统</h4>
              <p className="text-sm text-gray-600">神经架构搜索</p>
              <div className="mt-3 text-xs text-green-600">
                <div>拓扑进化</div>
                <div>物种形成</div>
                <div>复杂化</div>
              </div>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-lg p-6 text-center">
              <div className="bg-purple-100 p-4 rounded-full inline-flex mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-purple-800 mb-2">自适应学习</h4>
              <p className="text-sm text-gray-600">元学习能力</p>
              <div className="mt-3 text-xs text-purple-600">
                <div>经验回放</div>
                <div>迁移学习</div>
                <div>策略调整</div>
              </div>
            </div>
            <div className="bg-white border-2 border-orange-200 rounded-lg p-6 text-center">
              <div className="bg-orange-100 p-4 rounded-full inline-flex mb-4">
                <BarChart3 className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-orange-800 mb-2">A/B测试</h4>
              <p className="text-sm text-gray-600">自动化验证</p>
              <div className="mt-3 text-xs text-orange-600">
                <div>统计检验</div>
                <div>贝叶斯推断</div>
                <div>早期停止</div>
              </div>
            </div>
            <div className="bg-white border-2 border-red-200 rounded-lg p-6 text-center">
              <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                <Microscope className="w-8 h-8 text-red-600" />
              </div>
              <h4 className="text-lg font-semibold text-red-800 mb-2">进化管理</h4>
              <p className="text-sm text-gray-600">系统协调</p>
              <div className="mt-3 text-xs text-red-600">
                <div>冲突解决</div>
                <div>共识机制</div>
                <div>健康监控</div>
              </div>
            </div>
            <div className="bg-white border-2 border-indigo-200 rounded-lg p-6 text-center">
              <div className="bg-indigo-100 p-4 rounded-full inline-flex mb-4">
                <Heart className="w-8 h-8 text-indigo-600" />
              </div>
              <h4 className="text-lg font-semibold text-indigo-800 mb-2">性能监控</h4>
              <p className="text-sm text-gray-600">实时监测</p>
              <div className="mt-3 text-xs text-indigo-600">
                <div>指标收集</div>
                <div>趋势分析</div>
                <div>异常检测</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">技术栈</h4>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="text-sm">
                <div className="font-semibold">前端</div>
                <div className="text-gray-600">React + TypeScript</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">后端</div>
                <div className="text-gray-600">Node.js + Express</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">数据库</div>
                <div className="text-gray-600">PostgreSQL</div>
              </div>
              <div className="text-sm">
                <div className="font-semibold">AI/ML</div>
                <div className="text-gray-600">TensorFlow.js</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'market',
      title: '市场机会',
      subtitle: '巨大的市场潜力和增长空间',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-blue-800 mb-4">市场规模</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>全球牙科AI市场</span>
                    <span className="font-bold">$2.8B</span>
                  </div>
                  <div className="flex justify-between">
                    <span>年增长率</span>
                    <span className="font-bold text-green-600">+28.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>中国市场</span>
                    <span className="font-bold">$450M</span>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-green-800 mb-4">增长驱动</h4>
                <ul className="space-y-2 text-green-700">
                  <li>• 人口老龄化加剧</li>
                  <li>• 口腔健康意识提升</li>
                  <li>• 数字化医疗转型</li>
                  <li>• 政策支持AI医疗</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-purple-800 mb-4">目标市场</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>牙科诊所</span>
                    <span className="font-bold">180,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>口腔医院</span>
                    <span className="font-bold">12,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>综合医院牙科</span>
                    <span className="font-bold">35,000+</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="text-xl font-semibold text-orange-800 mb-4">市场趋势</h4>
                <ul className="space-y-2 text-orange-700">
                  <li>• AI医疗投资激增</li>
                  <li>• 远程医疗需求增长</li>
                  <li>• 精准医疗发展</li>
                  <li>• 个性化治疗需求</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-yellow-800 mb-2">市场机遇</h4>
              <p className="text-yellow-700">
                预计到2027年，全球牙科AI市场规模将达到65亿美元，年复合增长率超过30%
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'business',
      title: '商业模式',
      subtitle: '多元化收入来源，可持续增长',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="bg-blue-500 p-3 rounded-full inline-flex mb-4">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-blue-800 mb-3">SaaS订阅</h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div>• 基础版：$299/月</div>
                <div>• 专业版：$599/月</div>
                <div>• 企业版：$1299/月</div>
              </div>
              <div className="mt-4 text-xs text-blue-600">
                预计占总收入60%
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="bg-green-500 p-3 rounded-full inline-flex mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-green-800 mb-3">按次付费</h4>
              <div className="space-y-2 text-sm text-green-700">
                <div>• 单次分析：$29</div>
                <div>• 批量分析：$19/次</div>
                <div>• 紧急分析：$49</div>
              </div>
              <div className="mt-4 text-xs text-green-600">
                预计占总收入25%
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="bg-purple-500 p-3 rounded-full inline-flex mb-4">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-purple-800 mb-3">增值服务</h4>
              <div className="space-y-2 text-sm text-purple-700">
                <div>• API接口：$500/月</div>
                <div>• 定制开发：$10K+</div>
                <div>• 培训服务：$2K/天</div>
              </div>
              <div className="mt-4 text-xs text-purple-600">
                预计占总收入15%
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">收入预测</h4>
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">$2.5M</div>
                <div className="text-sm text-gray-600">2025年</div>
                <div className="text-xs text-gray-500">500家客户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">$8.2M</div>
                <div className="text-sm text-gray-600">2026年</div>
                <div className="text-xs text-gray-500">1500家客户</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">$18.5M</div>
                <div className="text-sm text-gray-600">2027年</div>
                <div className="text-xs text-gray-500">3000家客户</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <TrendingUp className="w-8 h-8 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-800">
                预计3年内实现盈亏平衡，5年内年收入超过5000万美元
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'competitive',
      title: '竞争优势',
      subtitle: '技术领先，难以复制',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">技术壁垒</h4>
                <ul className="space-y-2 text-blue-700">
                  <li>• 自我进化算法专利</li>
                  <li>• NEAT神经架构搜索</li>
                  <li>• 多系统协调机制</li>
                  <li>• 实时优化技术</li>
                </ul>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 mb-4">性能优势</h4>
                <ul className="space-y-2 text-green-700">
                  <li>• 准确率96.6% vs 行业85%</li>
                  <li>• 分析时间3分钟 vs 30分钟</li>
                  <li>• 24/7持续进化</li>
                  <li>• 零人工干预</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-800 mb-4">数据优势</h4>
                <ul className="space-y-2 text-purple-700">
                  <li>• 50万+标注影像</li>
                  <li>• 多中心数据采集</li>
                  <li>• 持续数据积累</li>
                  <li>• 隐私保护机制</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">市场优势</h4>
                <ul className="space-y-2 text-orange-700">
                  <li>• 首创自我进化概念</li>
                  <li>• 牙科专业深耕</li>
                  <li>• 医生社群认可</li>
                  <li>• 品牌影响力</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">竞争对手对比</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">公司</th>
                    <th className="text-center py-2">准确率</th>
                    <th className="text-center py-2">分析时间</th>
                    <th className="text-center py-2">自我进化</th>
                    <th className="text-center py-2">专利数量</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 font-semibold text-blue-600">DentalAI Pro</td>
                    <td className="text-center py-2 font-bold">96.6%</td>
                    <td className="text-center py-2 font-bold">3分钟</td>
                    <td className="text-center py-2">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">✓</span>
                    </td>
                    <td className="text-center py-2 font-bold">12</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">竞争对手A</td>
                    <td className="text-center py-2">85%</td>
                    <td className="text-center py-2">15分钟</td>
                    <td className="text-center py-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">✗</span>
                    </td>
                    <td className="text-center py-2">3</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">竞争对手B</td>
                    <td className="text-center py-2">82%</td>
                    <td className="text-center py-2">20分钟</td>
                    <td className="text-center py-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">✗</span>
                    </td>
                    <td className="text-center py-2">1</td>
                  </tr>
                  <tr>
                    <td className="py-2">竞争对手C</td>
                    <td className="text-center py-2">88%</td>
                    <td className="text-center py-2">12分钟</td>
                    <td className="text-center py-2">
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">✗</span>
                    </td>
                    <td className="text-center py-2">2</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <Shield className="w-8 h-8 text-red-600" />
              <span className="text-lg font-semibold text-red-800">
                12项核心技术专利，构建强大的知识产权保护壁垒
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'team',
      title: '核心团队',
      subtitle: '世界级的AI和医疗专家团队',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
              <div className="bg-blue-500 p-4 rounded-full inline-flex mb-4">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-blue-800 mb-2">CEO & 创始人</h4>
              <p className="text-blue-700 mb-3">李明博士</p>
              <ul className="space-y-1 text-sm text-blue-600">
                <li>• 清华大学计算机博士</li>
                <li>• 前谷歌AI研究院</li>
                <li>• 15年AI研发经验</li>
                <li>• 50+篇顶会论文</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
              <div className="bg-green-500 p-4 rounded-full inline-flex mb-4">
                <Microscope className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-green-800 mb-2">首席医疗官</h4>
              <p className="text-green-700 mb-3">王芳博士</p>
              <ul className="space-y-1 text-sm text-green-600">
                <li>• 北大口腔医学院博士</li>
                <li>• 20年牙科临床经验</li>
                <li>• 主任医师，教授</li>
                <li>• 30+篇SCI论文</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
              <div className="bg-purple-500 p-4 rounded-full inline-flex mb-4">
                <Cpu className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-purple-800 mb-2">CTO</h4>
              <p className="text-purple-700 mb-3">张伟博士</p>
              <ul className="space-y-1 text-sm text-purple-600">
                <li>• 中科院自动化所博士</li>
                <li>• 前微软研究院</li>
                <li>• 进化算法专家</li>
                <li>• 20+项AI专利</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
              <div className="bg-orange-500 p-4 rounded-full inline-flex mb-4">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-orange-800 mb-2">CFO</h4>
              <p className="text-orange-700 mb-3">刘静MBA</p>
              <ul className="space-y-1 text-sm text-orange-600">
                <li>• 沃顿商学院MBA</li>
                <li>• 前高盛投资银行</li>
                <li>• 医疗AI投资经验</li>
                <li>• 3次成功退出</li>
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">团队统计</h4>
            <div className="grid grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">25</div>
                <div className="text-sm text-gray-600">核心团队</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">15</div>
                <div className="text-sm text-gray-600">AI研究员</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">8</div>
                <div className="text-sm text-gray-600">医疗专家</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">85%</div>
                <div className="text-sm text-gray-600">博士/硕士</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <Star className="w-8 h-8 text-indigo-600" />
              <span className="text-lg font-semibold text-indigo-800">
                世界级的跨学科团队，AI与医疗的完美结合
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'financial',
      title: '财务预测',
      subtitle: '强劲的增长轨迹和盈利能力',
      content: (
        <div className="space-y-8">
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-blue-800 mb-4">2025年</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">收入</span>
                  <span className="font-bold">$2.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">毛利率</span>
                  <span className="font-bold text-green-600">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">净利润</span>
                  <span className="font-bold text-red-600">-$1.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">客户数</span>
                  <span className="font-bold">500</span>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-green-800 mb-4">2026年</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">收入</span>
                  <span className="font-bold">$8.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">毛利率</span>
                  <span className="font-bold text-green-600">82%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">净利润</span>
                  <span className="font-bold text-green-600">$1.8M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">客户数</span>
                  <span className="font-bold">1,500</span>
                </div>
              </div>
            </div>
            <div className="bg-purple-50 p-6 rounded-lg">
              <h4 className="text-lg font-semibold text-purple-800 mb-4">2027年</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">收入</span>
                  <span className="font-bold">$18.5M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">毛利率</span>
                  <span className="font-bold text-green-600">85%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">净利润</span>
                  <span className="font-bold text-green-600">$6.2M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">客户数</span>
                  <span className="font-bold">3,000</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">关键财务指标</h4>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">收入构成预测</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>SaaS订阅</span>
                    <div className="flex space-x-2">
                      <div className="w-20 bg-blue-200 rounded-full h-2 mt-1">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '60%'}}></div>
                      </div>
                      <span>60%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>按次付费</span>
                    <div className="flex space-x-2">
                      <div className="w-20 bg-green-200 rounded-full h-2 mt-1">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '25%'}}></div>
                      </div>
                      <span>25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span>增值服务</span>
                    <div className="flex space-x-2">
                      <div className="w-20 bg-purple-200 rounded-full h-2 mt-1">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '15%'}}></div>
                      </div>
                      <span>15%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold text-gray-700 mb-3">成本结构</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>研发成本</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>销售营销</span>
                    <span className="font-semibold">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>运营成本</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>管理费用</span>
                    <span className="font-semibold">20%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-center space-x-4">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <span className="text-lg font-semibold text-green-800">
                预计2026年实现盈利，2027年净利润率达到33.5%
              </span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'investment',
      title: '融资需求',
      subtitle: '加速增长，占领市场',
      content: (
        <div className="space-y-8">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-red-500 to-pink-500 p-4 rounded-full inline-flex">
              <DollarSign className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-3xl font-bold mt-4">寻求 $15M A轮融资</h3>
            <p className="text-lg text-gray-600 mt-2">用于产品研发、市场拓展和团队扩张</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-4">资金用途</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">产品研发</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-blue-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{width: '40%'}}></div>
                      </div>
                      <span className="text-sm font-semibold">40%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">市场拓展</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-green-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{width: '30%'}}></div>
                      </div>
                      <span className="text-sm font-semibold">30%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">团队扩张</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-purple-200 rounded-full h-2">
                        <div className="bg-purple-600 h-2 rounded-full" style={{width: '20%'}}></div>
                      </div>
                      <span className="text-sm font-semibold">20%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">运营资金</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-orange-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{width: '10%'}}></div>
                      </div>
                      <span className="text-sm font-semibold">10%</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-green-800 mb-4">投资亮点</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• 全球首创自我进化AI技术</li>
                  <li>• 96.6%行业领先准确率</li>
                  <li>• 巨大的市场增长潜力</li>
                  <li>• 世界级的技术团队</li>
                  <li>• 清晰的商业化路径</li>
                </ul>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-purple-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-purple-800 mb-4">融资历史</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">种子轮</span>
                    <span className="text-sm font-semibold">$2M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">估值</span>
                    <span className="text-sm font-semibold">$8M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">投资人</span>
                    <span className="text-sm font-semibold">知名天使</span>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">A轮目标</span>
                    <span className="text-sm font-semibold">$15M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">当前估值</span>
                    <span className="text-sm font-semibold">$45M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">出让股份</span>
                    <span className="text-sm font-semibold">25%</span>
                  </div>
                </div>
              </div>
              <div className="bg-orange-50 p-6 rounded-lg">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">预期回报</h4>
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">5-8X</div>
                    <div className="text-sm text-orange-700">3年预期回报</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">$150M</div>
                    <div className="text-sm text-green-700">5年预期估值</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">里程碑</h4>
            <div className="grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-blue-100 p-3 rounded-full inline-flex mb-2">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-semibold text-gray-800">12个月</div>
                <div className="text-sm text-gray-600">客户达到1500家</div>
              </div>
              <div>
                <div className="bg-green-100 p-3 rounded-full inline-flex mb-2">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-semibold text-gray-800">18个月</div>
                <div className="text-sm text-gray-600">实现盈亏平衡</div>
              </div>
              <div>
                <div className="bg-purple-100 p-3 rounded-full inline-flex mb-2">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div className="font-semibold text-gray-800">24个月</div>
                <div className="text-sm text-gray-600">启动B轮融资</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-red-50 to-red-100 p-6 rounded-lg">
            <div className="text-center">
              <h4 className="text-lg font-semibold text-red-800 mb-2">立即行动</h4>
              <p className="text-red-700">
                抓住这个改变牙科AI行业的投资机会，与我们一起打造人工智能自我进化的未来！
              </p>
            </div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">DentalAI Pro</h1>
          <p className="text-lg text-gray-600">项目 pitch deck - 不断自我进化的牙科影像智能分析系统</p>
        </div>

        {/* Slide Counter */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-full px-4 py-2 shadow-md">
            <span className="text-sm font-semibold text-gray-600">
              {currentSlide + 1} / {slides.length}
            </span>
          </div>
        </div>

        {/* Main Slide */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 min-h-[600px]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{slides[currentSlide].title}</h2>
            <p className="text-lg text-gray-600">{slides[currentSlide].subtitle}</p>
          </div>
          
          <div className="slide-content">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>上一页</span>
          </button>

          {/* Slide Indicators */}
          <div className="flex space-x-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide
                    ? 'bg-blue-600'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <span>下一页</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Slide Navigation Grid */}
        <div className="grid grid-cols-5 gap-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(index)}
              className={`p-3 rounded-lg text-xs font-medium transition-colors ${
                index === currentSlide
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {slide.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;