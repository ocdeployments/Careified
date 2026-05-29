import { Metadata } from 'next'
import ContactForm from './ContactForm'

export const metadata: Metadata = {
  title: 'Contact Careified',
  description: 'Get in touch with the Careified team. We support agencies and caregivers across Ontario and the US.',
}

export default function ContactPage() {
  return <ContactForm />
}