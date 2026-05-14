import http from 'k6/http'
import { check, sleep } from 'k6'
import { Rate } from 'k6/metrics'

const errorRate = new Rate('errors')

export const options = {
  stages: [
    { duration: '30s', target: 10 },  // ramp up
    { duration: '1m', target: 10 },   // sustained
    { duration: '30s', target: 0 },   // ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% under 3s
    errors: ['rate<0.1'],             // <10% error rate
  },
}

const BASE = 'http://localhost:3000'

export default function() {
  // Test match ranking API
  const res = http.post(
    `${BASE}/api/match/rank`,
    JSON.stringify({
      availability: ['morning'],
      service_area: 'Toronto',
      page: 1,
      limit: 20
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )

  check(res, {
    'status is 200 or 401': (r) =>
      r.status === 200 || r.status === 401,
    'response time < 3s': (r) =>
      r.timings.duration < 3000,
  })

  errorRate.add(res.status >= 500)
  sleep(1)
}