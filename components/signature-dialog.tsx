'use client'

import type React from 'react'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Trash2, Pen, Save } from 'lucide-react'
import { useTheme } from 'next-themes'

interface Point {
  x: number
  y: number
}

interface SignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (signatureData: string) => void
  title: string
  existingSignature?: string
}

export function SignatureDialog({
  open,
  onOpenChange,
  onSave,
  title,
  existingSignature,
}: SignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [lastPoint, setLastPoint] = useState<Point | null>(null)
  const [isEmpty, setIsEmpty] = useState(true)
  const { resolvedTheme } = useTheme()

  const getCanvasContext = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [])

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = getCanvasContext()
    if (!canvas || !ctx) return

    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)
    canvas.style.width = rect.width + 'px'
    canvas.style.height = rect.height + 'px'

    // Set drawing styles
    ctx.strokeStyle = resolvedTheme === 'dark' ? '#ffffff' : '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Fill with transparent background
    ctx.fillStyle = 'transparent'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [getCanvasContext, resolvedTheme])

  const loadExistingSignature = useCallback(() => {
    if (!existingSignature || !open) return

    const canvas = canvasRef.current
    const ctx = getCanvasContext()
    if (!canvas || !ctx) return

    const img = new Image()
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(
        img,
        0,
        0,
        canvas.width / window.devicePixelRatio,
        canvas.height / window.devicePixelRatio
      )
      setIsEmpty(false)
    }
    img.src = existingSignature
  }, [existingSignature, open, getCanvasContext])

  useEffect(() => {
    if (open) {
      // Small delay to ensure canvas is rendered
      setTimeout(() => {
        setupCanvas()
        loadExistingSignature()
      }, 100)
    }
  }, [open, setupCanvas, loadExistingSignature])

  const getPointFromEvent = (e: React.MouseEvent | React.TouchEvent): Point => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const point = getPointFromEvent(e)
    setIsDrawing(true)
    setLastPoint(point)
    setIsEmpty(false)
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    if (!isDrawing || !lastPoint) return

    const ctx = getCanvasContext()
    if (!ctx) return

    const currentPoint = getPointFromEvent(e)

    ctx.beginPath()
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(currentPoint.x, currentPoint.y)
    ctx.stroke()

    setLastPoint(currentPoint)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPoint(null)
  }

  const clearCanvas = () => {
    const ctx = getCanvasContext()
    const canvas = canvasRef.current
    if (!ctx || !canvas) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    // Create a new canvas with white background for better visibility
    const exportCanvas = document.createElement('canvas')
    const exportCtx = exportCanvas.getContext('2d')
    if (!exportCtx) return

    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height

    // Fill with white background
    exportCtx.fillStyle = '#ffffff'
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height)

    // Draw the signature on white background
    exportCtx.drawImage(canvas, 0, 0)

    // Get the data URL and save
    const signatureData = exportCanvas.toDataURL('image/png')
    onSave(signatureData)
  }

  const handleClose = () => {
    onOpenChange(false)
    // Reset canvas state when closing
    setIsEmpty(!existingSignature)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pen className="h-5 w-5" />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="w-full h-64 border-2 border-dashed border-muted-foreground/30 rounded-lg cursor-crosshair bg-background"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
            {isEmpty && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-muted-foreground text-sm">
                  Klik dan seret untuk menggambar tanda tangan
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={clearCanvas}
              disabled={isEmpty}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Hapus
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• Gambar dengan mouse atau layar sentuh</p>
            <p>• Tanda tangan akan disimpan sebagai gambar</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Batal
          </Button>
          <Button onClick={saveSignature} disabled={isEmpty} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Simpan Tanda Tangan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
