import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, MoveUp, MoveDown } from 'lucide-react'
import type { ServiceChecklist, ServiceChecklistItem } from '@/types/config'

interface ChecklistEditorProps {
  checklist: ServiceChecklist[]
  onChange: (checklist: ServiceChecklist[]) => void
}

export function ChecklistEditor({ checklist, onChange }: ChecklistEditorProps) {
  const [newSectionTitle, setNewSectionTitle] = useState('')
  const [newItemText, setNewItemText] = useState('')
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)

  const addSection = () => {
    if (!newSectionTitle.trim()) return

    onChange([
      ...checklist,
      {
        id: crypto.randomUUID(),
        title: newSectionTitle,
        items: []
      }
    ])
    setNewSectionTitle('')
  }

  const removeSection = (index: number) => {
    onChange(checklist.filter((_, i) => i !== index))
  }

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === checklist.length - 1)
    ) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    const newChecklist = [...checklist]
    const [removed] = newChecklist.splice(index, 1)
    newChecklist.splice(newIndex, 0, removed)
    onChange(newChecklist)
  }

  const addItem = (sectionIndex: number) => {
    if (!newItemText.trim()) return

    const newChecklist = [...checklist]
    newChecklist[sectionIndex].items.push({
      id: crypto.randomUUID(),
      text: newItemText,
      required: false
    })
    onChange(newChecklist)
    setNewItemText('')
  }

  const removeItem = (sectionIndex: number, itemIndex: number) => {
    const newChecklist = [...checklist]
    newChecklist[sectionIndex].items.splice(itemIndex, 1)
    onChange(newChecklist)
  }

  const moveItem = (sectionIndex: number, itemIndex: number, direction: 'up' | 'down') => {
    const items = checklist[sectionIndex].items
    if (
      (direction === 'up' && itemIndex === 0) ||
      (direction === 'down' && itemIndex === items.length - 1)
    ) return

    const newIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1
    const newChecklist = [...checklist]
    const [removed] = newChecklist[sectionIndex].items.splice(itemIndex, 1)
    newChecklist[sectionIndex].items.splice(newIndex, 0, removed)
    onChange(newChecklist)
  }

  const updateItem = (
    sectionIndex: number,
    itemIndex: number,
    updates: Partial<ServiceChecklistItem>
  ) => {
    const newChecklist = [...checklist]
    newChecklist[sectionIndex].items[itemIndex] = {
      ...newChecklist[sectionIndex].items[itemIndex],
      ...updates
    }
    onChange(newChecklist)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Nova seção..."
          value={newSectionTitle}
          onChange={e => setNewSectionTitle(e.target.value)}
        />
        <Button
          type="button"
          variant="outline"
          onClick={addSection}
          disabled={!newSectionTitle.trim()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Seção
        </Button>
      </div>

      {checklist.map((section, sectionIndex) => (
        <Card key={section.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveSection(sectionIndex, 'up')}
                disabled={sectionIndex === 0}
              >
                <MoveUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => moveSection(sectionIndex, 'down')}
                disabled={sectionIndex === checklist.length - 1}
              >
                <MoveDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSection(sectionIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {section.items.map((item, itemIndex) => (
              <div key={item.id} className="flex items-center gap-2">
                <Input
                  value={item.text}
                  onChange={e => updateItem(sectionIndex, itemIndex, { text: e.target.value })}
                />
                <Switch
                  checked={item.required}
                  onCheckedChange={checked => updateItem(sectionIndex, itemIndex, { required: checked })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(sectionIndex, itemIndex, 'up')}
                  disabled={itemIndex === 0}
                >
                  <MoveUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => moveItem(sectionIndex, itemIndex, 'down')}
                  disabled={itemIndex === section.items.length - 1}
                >
                  <MoveDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(sectionIndex, itemIndex)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Novo item..."
                value={newItemText}
                onChange={e => setNewItemText(e.target.value)}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    addItem(sectionIndex)
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => addItem(sectionIndex)}
                disabled={!newItemText.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}