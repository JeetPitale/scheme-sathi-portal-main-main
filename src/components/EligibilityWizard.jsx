import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

// Schema for validation
const formSchema = z.object({
    age: z.coerce.number().min(18, "Must be at least 18").max(100),
    state: z.string().min(1, "State is required"),
    category: z.string().min(1, "Category is required"),
    income: z.coerce.number().min(0, "Income must be positive"),
    occupation: z.string().min(1, "Occupation is required"),
    disabilityStatus: z.string().optional(),
});

const EligibilityWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            disabilityStatus: 'no'
        }
    });

    const onSubmit = (data) => {
        // Transform data types if needed
        const payload = {
            ...data,
            isStudent: data.occupation === 'Student',
            hasDisability: data.disabilityStatus === 'yes'
        };
        onComplete(payload);
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Check Eligibility - Step {step} of 2</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                    {step === 1 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" type="number" {...register('age')} placeholder="Enter your age" />
                                {errors.age && <p className="text-red-500 text-sm">{errors.age.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="state">State</Label>
                                <Select onValueChange={(val) => setValue('state', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Central">Central (All India)</SelectItem>
                                        <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                                        <SelectItem value="Gujarat">Gujarat</SelectItem>
                                        <SelectItem value="Karnataka">Karnataka</SelectItem>
                                        <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                                        <SelectItem value="Kerala">Kerala</SelectItem>
                                        <SelectItem value="Delhi">Delhi</SelectItem>
                                        <SelectItem value="West Bengal">West Bengal</SelectItem>
                                        <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                                        <SelectItem value="Punjab">Punjab</SelectItem>
                                        <SelectItem value="Telangana">Telangana</SelectItem>
                                        <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                                        <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                                        <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                                        <SelectItem value="Bihar">Bihar</SelectItem>
                                        <SelectItem value="Odisha">Odisha</SelectItem>
                                        <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                                        <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                                        <SelectItem value="Assam">Assam</SelectItem>
                                        <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                                        <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                                        <SelectItem value="Haryana">Haryana</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="category">Category</Label>
                                <Select onValueChange={(val) => setValue('category', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General</SelectItem>
                                        <SelectItem value="OBC">OBC</SelectItem>
                                        <SelectItem value="SC">SC</SelectItem>
                                        <SelectItem value="ST">ST</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
                            </div>

                            <Button type="button" onClick={nextStep} className="w-full">Next</Button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="income">Annual Family Income</Label>
                                <Input id="income" type="number" {...register('income')} placeholder="e.g. 150000" />
                                {errors.income && <p className="text-red-500 text-sm">{errors.income.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="occupation">Occupation</Label>
                                <Select onValueChange={(val) => setValue('occupation', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Occupation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Farmer">Farmer</SelectItem>
                                        <SelectItem value="Student">Student</SelectItem>
                                        <SelectItem value="Employed">Employed</SelectItem>
                                        <SelectItem value="Unemployed">Unemployed</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.occupation && <p className="text-red-500 text-sm">{errors.occupation.message}</p>}
                            </div>

                            <div>
                                <Label htmlFor="disabilityStatus">Disability Status</Label>
                                <Select onValueChange={(val) => setValue('disabilityStatus', val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="no">No</SelectItem>
                                        <SelectItem value="yes">Yes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex gap-4">
                                <Button type="button" variant="outline" onClick={prevStep} className="w-1/2">Back</Button>
                                <Button type="submit" className="w-1/2">Check Eligibility</Button>
                            </div>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    );
};

export default EligibilityWizard;
