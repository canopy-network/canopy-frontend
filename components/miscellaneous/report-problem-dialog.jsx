import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { AlertTriangle, Ban, Shield, FileWarning, TrendingDown, Scale } from 'lucide-react'

const reportReasons = {
  scam: {
    icon: Ban,
    label: 'Scam/Fraud',
    options: [
      'Rug pull attempt',
      'Fake/misleading project',
      'Impersonation',
      'Pump and dump scheme'
    ]
  },
  inappropriate: {
    icon: AlertTriangle,
    label: 'Inappropriate Content',
    options: [
      'Offensive or hateful content',
      'Adult/NSFW content',
      'Violence or illegal activities',
      'Harassment'
    ]
  },
  security: {
    icon: Shield,
    label: 'Security Concerns',
    options: [
      'Malicious code in repository',
      'Contract vulnerabilities',
      'Backdoors or admin keys abuse',
      'Suspicious smart contract behavior'
    ]
  },
  misleading: {
    icon: FileWarning,
    label: 'Misleading Information',
    options: [
      'False claims or promises',
      'Fake team/advisors',
      'Plagiarized documentation',
      'Fake partnerships'
    ]
  },
  manipulation: {
    icon: TrendingDown,
    label: 'Market Manipulation',
    options: [
      'Wash trading',
      'Price manipulation',
      'Coordinated pump schemes',
      'Fake volume',
      'Other manipulation tactics'
    ]
  },
  legal: {
    icon: Scale,
    label: 'Legal/Copyright Issues',
    options: [
      'Copyright infringement',
      'Trademark violation',
      'Using others\' IP without permission',
      'Regulatory violations'
    ]
  }
}

export default function ReportProblemDialog({ open, onOpenChange, chainData }) {
  const [mainReason, setMainReason] = useState('')
  const [specificReason, setSpecificReason] = useState('')
  const [additionalComments, setAdditionalComments] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!mainReason || !specificReason) {
      toast.error('Please select both main and specific reasons')
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Report submitted successfully', {
        description: 'Our team will review your report shortly.'
      })
      setIsSubmitting(false)
      handleClose()
    }, 1500)
  }

  const handleClose = () => {
    setMainReason('')
    setSpecificReason('')
    setAdditionalComments('')
    onOpenChange(false)
  }

  const handleMainReasonChange = (value) => {
    setMainReason(value)
    setSpecificReason('') // Reset specific reason when main reason changes
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report {chainData?.name}</DialogTitle>
          <DialogDescription>
            Help us keep the Canopy ecosystem safe by reporting chains that violate our policies.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {/* Main Reason */}
          <div className="space-y-2">
            <Label className="block text-sm font-medium">Choose a reason</Label>
            <RadioGroup value={mainReason} onValueChange={handleMainReasonChange}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(reportReasons).map(([key, { icon: IconComponent, label }]) => (
                  <div key={key}>
                    <RadioGroupItem
                      value={key}
                      id={key}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={key}
                      className="flex items-center gap-3 p-4 rounded-lg border-1 border-muted bg-muted/30 hover:bg-muted/50 cursor-pointer transition-all peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                    >
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">{label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {/* Specific Reason - Only show when main reason is selected */}
          {mainReason && (
            <div className="space-y-2">
              <Label className="block text-sm font-medium">Specify the issue</Label>
              <RadioGroup value={specificReason} onValueChange={setSpecificReason}>
                <div className="space-y-3">
                  {reportReasons[mainReason].options.map((option) => (
                    <div key={option} className="flex items-center space-x-3">
                      <RadioGroupItem value={option} id={option} />
                      <Label
                        htmlFor={option}
                        className="font-normal cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Additional Comments */}
          {specificReason && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="comments" className="block text-sm font-medium">
                  Additional comments
                </Label>
                <Badge variant="secondary" className="text-xs">Optional</Badge>
              </div>
              <Textarea
                id="comments"
                placeholder="Provide any additional details that might help us investigate this report..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                {additionalComments.length}/500 characters
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!mainReason || !specificReason || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Send Report'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
