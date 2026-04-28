export type PhoneRegion = 'CA' | 'US'

const CA_AREA_CODES = [
  '204','226','236','249','250','289','306','343','365',
  '387','403','416','418','431','437','438','450','506',
  '514','519','548','579','581','587','604','613','639',
  '647','672','705','709','742','778','780','782','807',
  '819','825','867','873','902','905'
]

export function detectRegion(phoneNumber: string): PhoneRegion {
  const digits = phoneNumber.replace(/\D/g, '')
  const areaCode = digits.startsWith('1')
    ? digits.slice(1, 4)
    : digits.slice(0, 3)
  return CA_AREA_CODES.includes(areaCode) ? 'CA' : 'US'
}

export function isWithinCallingHours(
  phoneNumber: string,
  now?: Date
): { allowed: boolean; reason?: string; retryAfter?: string } {
  const region = detectRegion(phoneNumber)
  const date = now || new Date()
  const timezone = region === 'CA'
    ? 'America/Toronto'
    : 'America/Chicago'

  const localTime = new Date(
    date.toLocaleString('en-US', { timeZone: timezone })
  )

  const hour = localTime.getHours()
  const minute = localTime.getMinutes()
  const dayOfWeek = localTime.getDay()
  const timeDecimal = hour + minute / 60

  if (region === 'CA') {
    if (dayOfWeek === 0) {
      if (timeDecimal < 10 || timeDecimal >= 18) {
        return {
          allowed: false,
          reason: 'Outside CRTC calling hours (Sunday 10am-6pm)',
          retryAfter: 'Today at 10:00 AM local time'
        }
      }
    } else if (dayOfWeek === 6) {
      if (timeDecimal < 10 || timeDecimal >= 18) {
        return {
          allowed: false,
          reason: 'Outside CRTC calling hours (Saturday 10am-6pm)',
          retryAfter: 'Today at 10:00 AM local time'
        }
      }
    } else {
      if (timeDecimal < 9 || timeDecimal >= 21.5) {
        return {
          allowed: false,
          reason: 'Outside CRTC calling hours (Weekdays 9am-9:30pm)',
          retryAfter: 'Today at 9:00 AM local time'
        }
      }
    }
  } else {
    if (timeDecimal < 8 || timeDecimal >= 21) {
      return {
        allowed: false,
        reason: 'Outside TCPA calling hours (8am-9pm local)',
        retryAfter: 'Today at 8:00 AM local time'
      }
    }
  }

  return { allowed: true }
}
