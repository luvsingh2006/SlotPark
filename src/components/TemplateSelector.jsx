import { LAYOUT_TEMPLATES } from '../utils/layoutTemplates'
import './TemplateSelector.css'

export function TemplateSelector({ onSelectTemplate }) {
  const handleChange = (e) => {
    const templateId = e.target.value
    if (!templateId) return
    onSelectTemplate(templateId)
    e.target.value = '' // reset so the same template can be picked again later
  }

  return (
    <select
      className="template-selector"
      defaultValue=""
      onChange={handleChange}
      aria-label="Load a preset layout template"
    >
      <option value="" disabled>
        Load Template...
      </option>
      {LAYOUT_TEMPLATES.map((template) => (
        <option key={template.id} value={template.id}>
          {template.name}
        </option>
      ))}
    </select>
  )
}
