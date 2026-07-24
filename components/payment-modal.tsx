"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { paymentAPI, type PaymentRequest } from "@/lib/api"
import { CheckCircle2, Loader2 } from "lucide-react"

interface PaymentModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    produceId: number
    produceName: string
    amount: number
}

export function PaymentModal({ open, onOpenChange, produceId, produceName, amount }: PaymentModalProps) {
    const [step, setStep] = useState<"method" | "details" | "processing" | "success">("method")
    const [paymentMethod, setPaymentMethod] = useState("")
    const [accountNumber, setAccountNumber] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const handlePaymentMethodSelect = (method: string) => {
        setPaymentMethod(method)
        setStep("details")
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsProcessing(true)
        setStep("processing")

        try {
            const paymentData: PaymentRequest = {
                produceId,
                amount,
                paymentMethod,
                accountNumber,
            }

            await paymentAPI.processPayment(paymentData)
            setStep("success")
        } catch (error) {
            console.error("Payment failed:", error)
            alert("Payment failed. Please try again.")
            setStep("details")
        } finally {
            setIsProcessing(false)
        }
    }

    const handleClose = () => {
        setStep("method")
        setPaymentMethod("")
        setAccountNumber("")
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Purchase {produceName}</DialogTitle>
                    <DialogDescription>
                        Total Amount: Le {amount.toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                {step === "method" && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold mb-3">Select Payment Method</h3>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Mobile Money</h4>
                                <div className="grid grid-cols-3 gap-2">
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("AfriMoney")}>
                                        AfriMoney
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("OrangeMoney")}>
                                        Orange Money
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("QMoney")}>
                                        QMoney
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2 mt-4">
                                <h4 className="text-sm font-medium text-muted-foreground">Bank Transfer</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("SLCB")}>
                                        SLCB
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("Rokel")}>
                                        Rokel Bank
                                    </Button>
                                    <Button variant="outline" onClick={() => handlePaymentMethodSelect("GTBank")}>
                                        GT Bank
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {step === "details" && (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <Input value={paymentMethod} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accountNumber">Account/Phone Number</Label>
                            <Input
                                id="accountNumber"
                                placeholder="Enter your account or phone number"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={() => setStep("method")} className="flex-1">
                                Back
                            </Button>
                            <Button type="submit" className="flex-1">
                                Pay Le {amount.toLocaleString()}
                            </Button>
                        </div>
                    </form>
                )}

                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Processing your payment...</p>
                    </div>
                )}

                {step === "success" && (
                    <div className="flex flex-col items-center justify-center py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                        <p className="text-muted-foreground text-center mb-6">
                            Your payment of Le {amount.toLocaleString()} has been processed successfully.
                        </p>
                        <Button onClick={handleClose} className="w-full">
                            Done
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
