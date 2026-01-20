import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData, ApiError } from '../types/analytics';
import AnalyticsChart from '../components/AnalyticsChartNew';
import BeforeAfterToggle from '../components/BeforeAfterToggle';

/**
 * Executive Summary Page Component
 * Displays executive summary analytics with line chart and KPIs
 * Supports Before/After toggle for data comparison
 */
export default function ExecutiveSummaryPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggleValue, setToggleValue] = useState<'before' | 'after'>('after');

  /**
   * Fetch executive summary data from API
   */
  const fetchData = async (before?: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await analyticsApi.getExecutiveSummary(before);
      setData(result);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Failed to load Executive Summary data');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle Before/After toggle change
   */
  const handleToggleChange = (value: 'before' | 'after') => {
    setToggleValue(value);
    fetchData(value === 'before');
  };

  /**
   * Handle retry button click
   */
  const handleRetry = () => {
    fetchData(toggleValue === 'before');
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData(false); // Default to "after" data
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Floating Navigation Menu */}
      <div className="fixed top-4 left-4 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 p-2">
          <div className="flex flex-col gap-2">
            <button className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer">
              <div className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-blue-600">Dashboard</span>
            </button>
            <button className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-green-50 transition-all duration-300 cursor-pointer">
              <div className="w-2 h-2 bg-green-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-green-600">Analytics</span>
            </button>
            <button className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-purple-50 transition-all duration-300 cursor-pointer">
              <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:scale-125 transition-transform"></div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-purple-600">Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="group bg-gradient-to-r from-blue-500 to-purple-500 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110">
          <svg className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="fixed top-4 right-4 z-40">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Analytics</span>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-blue-600 font-medium">Executive Summary</span>
          </div>
        </div>
      </div>
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#002147] via-[#003366] to-[#004080] text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="relative px-6 py-12 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold font-serif tracking-tight bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                      Executive Summary
                    </h1>
                    <p className="text-xs text-blue-100 mt-0.5 font-medium tracking-wide">
                      Key Performance Indicators & National Trends
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-xs text-blue-200">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">Live Data</span>
                  </div>
                  <div className="w-px h-3 bg-blue-300/30"></div>
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-white/10 rounded-full backdrop-blur-sm hover:bg-white/20 transition-all duration-300 cursor-pointer">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Updated {new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0">
                <BeforeAfterToggle
                  value={toggleValue}
                  onChange={handleToggleChange}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-8 px-6 sm:px-8 lg:px-12 pb-16">
        <div className="mx-auto max-w-7xl">
          {/* Status Indicators */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-2 h-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">System Status</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">Operational</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse" style={{width: '98%'}}></div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Data Quality</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Excellent</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse" style={{width: '95%'}}></div>
              </div>
            </div>

            <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-white/20 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-100 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-2 h-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Security Level</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-purple-600 transition-colors">Level 3</p>
                </div>
              </div>
              <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-400 to-purple-500 rounded-full animate-pulse" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>

          {/* Main Analytics Card */}
          <div className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.01]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full group-hover:h-8 transition-all duration-300"></div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                      {toggleValue === 'after' ? 'Advanced Analytics Dashboard' : 'Raw Data Overview'}
                    </h2>
                    <p className="text-xs text-gray-600 mt-0.5 group-hover:text-gray-700 transition-colors">
                      {toggleValue === 'after' 
                        ? 'Comprehensive insights and performance metrics' 
                        : 'Unprocessed data statistics and basic information'
                      }
                    </p>
                  </div>
                </div>
                
                {toggleValue === 'before' && (
                  <div className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium hover:bg-amber-200 transition-colors cursor-pointer">
                    Raw Data Mode
                  </div>
                )}
                
                {toggleValue === 'after' && (
                  <div className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-medium hover:from-blue-200 hover:to-purple-200 transition-all cursor-pointer">
                    AI-Enhanced
                  </div>
                )}
              </div>

              <AnalyticsChart
                chartType={data?.chartType || 'line'}
                data={{
                  labels: data?.labels || [],
                  datasets: data?.datasets || []
                }}
                title={data?.title || 'Executive Summary'}
                kpis={data?.kpis || []}
                isLoading={isLoading}
                error={error || undefined}
                onRetry={handleRetry}
              />
            </div>
          </div>

          {/* Insights Panel */}
          {!isLoading && !error && data && (
            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-green-100 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-2 h-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Key Insights</h3>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-blue-50/50 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {toggleValue === 'after' 
                        ? 'System performance shows strong operational efficiency with minimal anomalies detected.'
                        : 'Raw data contains comprehensive records across all major data categories.'
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-green-50/50 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {toggleValue === 'after'
                        ? 'Growth trends indicate positive trajectory with sustainable expansion patterns.'
                        : 'Data quality metrics show high completeness and consistency across datasets.'
                      }
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-purple-50/50 transition-colors cursor-pointer">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-xs leading-relaxed">
                      {toggleValue === 'after'
                        ? 'Security protocols maintain optimal protection levels with proactive monitoring.'
                        : 'Processing capabilities demonstrate robust handling of large-scale data volumes.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-md hover:shadow-xl hover:bg-white/90 transition-all duration-300 cursor-pointer transform hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-4 h-4 bg-blue-100 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-2 h-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">Recommendations</h3>
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50/70 rounded-lg border-l-4 border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-blue-900">Optimization</p>
                      <svg className="w-3 h-3 text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {toggleValue === 'after'
                        ? 'Continue monitoring current performance levels and prepare for scaling initiatives.'
                        : 'Consider implementing advanced analytics to unlock deeper insights from raw data.'
                      }
                    </p>
                  </div>
                  <div className="p-3 bg-green-50/70 rounded-lg border-l-4 border-green-400 hover:bg-green-50 transition-colors cursor-pointer group/item">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-medium text-green-900">Enhancement</p>
                      <svg className="w-3 h-3 text-green-600 opacity-0 group-hover/item:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-xs text-green-700 leading-relaxed">
                      {toggleValue === 'after'
                        ? 'Explore predictive modeling opportunities to anticipate future trends.'
                        : 'Establish automated quality checks to maintain data integrity standards.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="mt-12 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-blue-200">Quick Links</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">Dashboard Overview</a>
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">Data Analytics</a>
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">Performance Metrics</a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-green-200">Resources</h4>
              <div className="space-y-2">
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">API Documentation</a>
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">User Guide</a>
                <a href="#" className="block text-xs text-gray-300 hover:text-white hover:underline transition-colors cursor-pointer">Support Center</a>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-purple-200">System Info</h4>
              <div className="space-y-2">
                <p className="text-xs text-gray-300">Version 3.0.1</p>
                <p className="text-xs text-gray-300">Last Updated: {new Date().toLocaleDateString()}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-300">System Online</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-amber-200">Connect</h4>
              <div className="flex gap-3">
                <button className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors cursor-pointer">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-gray-400">© 2024 Aadhaar Analytics Platform. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                <a href="#" className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}