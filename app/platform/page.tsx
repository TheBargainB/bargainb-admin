import type React from "react"

export default function PlatformPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Compare Prices & Find the Best Deals
          </h1>
          <div className="max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Categories</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Groceries</a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Dairy & Eggs</a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Meat & Seafood</a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Fruits & Vegetables</a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Beverages</a>
                <a href="#" className="block text-gray-700 hover:text-blue-600 py-2">Household Items</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Sample Product {item}</h4>
                    <p className="text-sm text-gray-600 mb-3">Product description goes here...</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-green-600">$9.99</span>
                        <span className="text-sm text-gray-500 ml-2 line-through">$12.99</span>
                      </div>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                        Compare
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 