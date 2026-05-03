import CaregiverProfileDemo from '@/components/profile/CaregiverProfileDemo'

export default function ProfileDemoPage() {
  return (
    <CaregiverProfileDemo
      firstName="Maria"
      lastName="Santos"
      jobTitle="Personal Support Worker"
      credential="PSW"
      city="Toronto"
      state="ON"
      yearsExperience={8}
      availabilityStatus="available_now"
      hourlyRateMin={24}
      hourlyRateMax={28}
      openToUrgent={true}
      willingLiveIn={true}
      hasVehicle={true}
      aggregateScore={4.8}
      ratingCount={12}
      profileCompletion={94}
    />
  )
}
