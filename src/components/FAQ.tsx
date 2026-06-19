import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

const faqs = [
  {
    question: 'Are the tools really free?',
    answer:
      'Yes! All basic tools are completely free with no hidden fees. Pro features are optional for power users who need advanced capabilities.',
  },
  {
    question: 'Do my files get uploaded to your servers?',
    answer:
      'No. Crafvia processes files entirely in your browser using Web APIs. Your data stays on your device and is never sent to our servers.',
  },
  {
    question: 'How does browser-based processing work?',
    answer:
      'We use modern browser technologies like WebAssembly and the File API to run tools locally. When you select a file, it stays in memory on your computer while the tool processes it.',
  },
  {
    question: 'Is there a file size limit?',
    answer:
      'Limits depend on your device memory and browser. Most tools handle files up to several hundred MB. Very large files may be slower on older devices.',
  },
  {
    question: 'Do I need to create an account?',
    answer:
      'No account is required for any of our free tools. You can use everything instantly without signing up or providing an email.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="faq-section">
      <h2 className="section-title">Frequently asked questions</h2>
      <ul className="faq-list">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index
          return (
            <li key={faq.question}>
              <button
                type="button"
                className={`faq-item ${isOpen ? 'faq-item-open' : ''}`}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                aria-expanded={isOpen}
              >
                <span className="faq-question">{faq.question}</span>
                <ChevronDown
                  size={20}
                  className="faq-chevron"
                  aria-hidden
                />
              </button>
              {isOpen && <div className="faq-answer">{faq.answer}</div>}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
