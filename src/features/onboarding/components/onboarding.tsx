"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Plus, BarChart3, Download, ChevronRight, X } from "lucide-react";

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        title: "Welcome to Habit Tracker",
        description: "Build better habits, one day at a time. Track your daily progress and achieve your goals.",
        icon: "👋",
    },
    {
        title: "Add Your Habits",
        description: "Click 'Add Habit' to create habits you want to track. Set a name, emoji, and monthly goal.",
        icon: Plus,
    },
    {
        title: "Check Off Daily",
        description: "Each day, check off the habits you completed. Watch your progress grow!",
        icon: Check,
    },
    {
        title: "Track Your Progress",
        description: "View detailed analytics showing your daily completion rates and habit streaks.",
        icon: BarChart3,
    },
    {
        title: "Install for Quick Access",
        description: "Add this app to your home screen for instant access. Works offline too!",
        icon: Download,
    },
];

export const Onboarding = ({ onComplete }: OnboardingProps) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const step = steps[currentStep];

    return (
        <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-card border border-border rounded-xl p-8 relative">
                    <button
                        onClick={handleSkip}
                        className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center space-y-6">
                        {/* Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
                                {typeof step.icon === "string" ? (
                                    <span className="text-4xl">{step.icon}</span>
                                ) : (
                                    <step.icon className="w-10 h-10 text-primary" />
                                )}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                            <h2 className="text-2xl font-bold text-foreground">{step.title}</h2>
                            <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                        </div>

                        {/* Progress dots */}
                        <div className="flex justify-center gap-2">
                            {steps.map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-2 h-2 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" onClick={handleSkip} className="flex-1">
                                Skip
                            </Button>
                            <Button onClick={handleNext} className="flex-1 gap-2">
                                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
