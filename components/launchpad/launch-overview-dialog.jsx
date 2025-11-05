import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ArrowRight, Github, Palette, Sparkles } from 'lucide-react'

export default function LaunchOverviewDialog({ open, onClose, onStart }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" noAnimation>
        <DialogHeader className="space-y-4 text-center pb-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <div>
            <DialogTitle className="text-2xl mb-2 text-center">Launch Your Blockchain</DialogTitle>
            <DialogDescription className="text-base text-center px-4">
              Get your own Layer 1 blockchain up and running. We just need a couple things from you:
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* Requirements */}
        <div className="space-y-6 py-6">
          {/* Requirement 1 */}
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Github className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-base mb-1.5">
                Choose a Template
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Select from pre-built templates ready to fork and connect
              </p>
            </div>
          </div>

          {/* Requirement 2 */}
          <div className="flex gap-4 items-start">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary flex-shrink-0">
              <Palette className="w-6 h-6" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-base mb-1.5">
                Add Your Branding
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your chain logo and add relevant links (website, docs, socials, etc.)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-4 pt-6 border-t">
          <Button onClick={onStart} size="lg" className="w-full gap-2">
            Let's Go
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Should take about 5 minutes
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
