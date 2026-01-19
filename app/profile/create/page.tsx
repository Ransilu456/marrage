'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
    { id: 'personal', title: 'Personal Details' },
    { id: 'lifestyle', title: 'Lifestyle & Profession' },
    { id: 'family', title: 'Family Background' },
    { id: 'preferences', title: 'Partner Preferences' }
];

export default function CreateProfilePage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        // Personal
        dateOfBirth: '',
        gender: '',
        height: '',
        religion: '',
        caste: '',
        motherTongue: '',
        bio: '',
        location: '',

        // Lifestyle
        jobStatus: 'EMPLOYED',
        maritalStatus: 'SINGLE',
        education: '',
        profession: '',
        incomeRange: '',
        diet: '',
        smoking: 'No',
        drinking: 'No',

        // Family
        fatherOccupation: '',
        motherOccupation: '',
        siblings: '',
        familyType: 'TRADITIONAL',

        // Preferences
        prefAgeMin: '18',
        prefAgeMax: '50',
        prefHeightMin: '',
        prefReligion: '',
        prefEducation: '',
        prefLifestyle: '',

        // Media
        photoUrl: '',
        coverUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep < STEPS.length - 1) {
            handleNext();
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    height: formData.height ? parseFloat(formData.height) : undefined,
                    prefAgeMin: parseInt(formData.prefAgeMin),
                    prefAgeMax: parseInt(formData.prefAgeMax),
                    prefHeightMin: formData.prefHeightMin ? parseFloat(formData.prefHeightMin) : undefined,
                }),
            });

            if (res.ok) {
                router.push('/discover');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create profile');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input type="date" required value={formData.dateOfBirth} onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                    <option value="">Select...</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Height (cm)</label>
                                <input type="number" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Religion</label>
                                <input type="text" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Location</label>
                            <input type="text" required value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Bio</label>
                            <textarea rows={3} required value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Profile Photo URL</label>
                            <input type="url" required value={formData.photoUrl} onChange={e => setFormData({ ...formData, photoUrl: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" placeholder="https://..." />
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Job Status</label>
                                <select value={formData.jobStatus} onChange={e => setFormData({ ...formData, jobStatus: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                    <option value="EMPLOYED">Employed</option>
                                    <option value="UNEMPLOYED">Unemployed</option>
                                    <option value="SELF_EMPLOYED">Self-Employed</option>
                                    <option value="STUDENT">Student</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Marital Status</label>
                                <select value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                    <option value="SINGLE">Single</option>
                                    <option value="DIVORCED">Divorced</option>
                                    <option value="WIDOWED">Widowed</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Education</label>
                                <input type="text" value={formData.education} onChange={e => setFormData({ ...formData, education: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Profession</label>
                                <input type="text" value={formData.profession} onChange={e => setFormData({ ...formData, profession: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Diet</label>
                                <input type="text" value={formData.diet} onChange={e => setFormData({ ...formData, diet: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" placeholder="Veg/Non-Veg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Smoking</label>
                                <select value={formData.smoking} onChange={e => setFormData({ ...formData, smoking: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Drinking</label>
                                <select value={formData.drinking} onChange={e => setFormData({ ...formData, drinking: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                    <option value="No">No</option>
                                    <option value="Occasionally">Occasionally</option>
                                    <option value="Yes">Yes</option>
                                </select>
                            </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Father's Occupation</label>
                                <input type="text" value={formData.fatherOccupation} onChange={e => setFormData({ ...formData, fatherOccupation: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mother's Occupation</label>
                                <input type="text" value={formData.motherOccupation} onChange={e => setFormData({ ...formData, motherOccupation: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Siblings Details</label>
                            <input type="text" value={formData.siblings} onChange={e => setFormData({ ...formData, siblings: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" placeholder="e.g., 1 brother, 1 sister" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Family Type</label>
                            <select value={formData.familyType} onChange={e => setFormData({ ...formData, familyType: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm">
                                <option value="TRADITIONAL">Traditional</option>
                                <option value="MODERN">Modern</option>
                                <option value="JOINT">Joint Family</option>
                                <option value="NUCLEAR">Nuclear Family</option>
                            </select>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-500">What are you looking for in a partner?</p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Min Age</label>
                                <input type="number" value={formData.prefAgeMin} onChange={e => setFormData({ ...formData, prefAgeMin: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Max Age</label>
                                <input type="number" value={formData.prefAgeMax} onChange={e => setFormData({ ...formData, prefAgeMax: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preferred Religion</label>
                            <input type="text" value={formData.prefReligion} onChange={e => setFormData({ ...formData, prefReligion: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Preferred Education</label>
                            <input type="text" value={formData.prefEducation} onChange={e => setFormData({ ...formData, prefEducation: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 sm:text-sm" />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        {STEPS.map((step, idx) => (
                            <div key={step.id} className={`text-xs font-semibold uppercase tracking-wider ${idx <= currentStep ? 'text-rose-600' : 'text-slate-400'}`}>
                                {step.title}
                            </div>
                        ))}
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-rose-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-8">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">
                        {STEPS[currentStep].title}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderStep()}
                            </motion.div>
                        </AnimatePresence>

                        <div className="flex justify-between pt-6 border-t border-slate-100">
                            {currentStep > 0 ? (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="px-6 py-2 rounded-xl text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Back
                                </button>
                            ) : <div />}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-10 py-2.5 bg-rose-600 text-white rounded-xl font-semibold shadow-lg shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {currentStep === STEPS.length - 1 ? (submitting ? 'Creating...' : 'Complete Profile') : 'Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
