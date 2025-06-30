import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header Loading */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-10 w-20" />
        </div>

        {/* Stats Loading */}
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Chat Interface Loading */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Contacts List Loading */}
        <Card className="md:col-span-1">
          <CardHeader>
            <Skeleton className="h-6 w-20 mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-0">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Messages Loading */}
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Messages Loading */}
              <div className="h-[300px] p-4 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className="max-w-[70%]">
                      <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-32' : 'w-40'} rounded-lg`} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Send Message Loading */}
              <div className="flex space-x-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
