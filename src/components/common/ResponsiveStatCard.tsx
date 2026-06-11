'use client'

interface ResponsiveStatCardProps {
  title: string
  value: number | string
  icon: string
  color?: 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'yellow'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function ResponsiveStatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend 
}: ResponsiveStatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <div className={`bg-linear-to-r ${colorClasses[color]} rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white transition-all hover:scale-102`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm opacity-90 truncate">{title}</p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold mt-1 sm:mt-2 wrap-break-word">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-xs mt-2 ${trend.isPositive ? 'text-green-200' : 'text-red-200'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
            </p>
          )}
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 ml-2">
          <span className="text-xl sm:text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}