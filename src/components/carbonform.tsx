import React, { useState } from 'react';
import MarkdownRenderer from '../MarkdownRenderer';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth, firestore } from '../firebase'; 
import { doc, getDoc, setDoc, arrayUnion } from 'firebase/firestore';

type FuelType = 'petrol' | 'diesel' | 'electric' | 'naturalGas';

interface FormData {
    businessName: string;
    address: string;
    industryType: string;
    energyConsumption: string;
    renewableEnergyUsage: string;
    distanceTraveled: string;
    fuelType: FuelType; 
    fuelConsumption: string;
    totalWasteProduced: string;
    wasteRecycled: string;
}

const CarbonForm: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        businessName: '',
        address: '',
        industryType: '',
        energyConsumption: '',
        renewableEnergyUsage: '',
        distanceTraveled: '',
        fuelType: 'petrol', 
        fuelConsumption: '',
        totalWasteProduced: '',
        wasteRecycled: '',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submissionStatus, setSubmissionStatus] = useState<string>('');
    const [totalEmissions, setTotalEmissions] = useState<number | null>(null);
    const [reductionStrategy, setReductionStrategy] = useState<string | null>(null);
    const [carbonCredits, setCarbonCredits] = useState<number>(0);
    
    const handleChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement> = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const validate = () => {
        const tempErrors: Record<string, string> = {};
        let isValid = true;

        if (!formData.businessName) {
            tempErrors.businessName = 'Business Name is required.';
            isValid = false;
        }
        if (!formData.address) {
            tempErrors.address = 'Address is required.';
            isValid = false;
        }
        if (!formData.industryType) {
            tempErrors.industryType = 'Industry Type is required.';
            isValid = false;
        }
        if (!formData.energyConsumption || parseFloat(formData.energyConsumption) <= 0) {
            tempErrors.energyConsumption = 'Energy Consumption must be a positive number.';
            isValid = false;
        }
        if (formData.renewableEnergyUsage && (parseFloat(formData.renewableEnergyUsage) < 0 || parseFloat(formData.renewableEnergyUsage) > 100)) {
            tempErrors.renewableEnergyUsage = 'Renewable Energy Usage must be between 0 and 100.';
            isValid = false;
        }
        if (!formData.distanceTraveled || parseFloat(formData.distanceTraveled) <= 0) {
            tempErrors.distanceTraveled = 'Distance Traveled must be a positive number.';
            isValid = false;
        }
        if (!formData.fuelType) {
            tempErrors.fuelType = 'Type of Fuel Used is required.';
            isValid = false;
        }
        if (!formData.fuelConsumption || parseFloat(formData.fuelConsumption) <= 0) {
            tempErrors.fuelConsumption = 'Fuel Consumption must be a positive number.';
            isValid = false;
        }
        if (!formData.totalWasteProduced || parseFloat(formData.totalWasteProduced) <= 0) {
            tempErrors.totalWasteProduced = 'Total Waste Produced must be a positive number.';
            isValid = false;
        }
        if (formData.wasteRecycled && (parseFloat(formData.wasteRecycled) < 0 || parseFloat(formData.wasteRecycled) > parseFloat(formData.totalWasteProduced))) {
            tempErrors.wasteRecycled = 'Waste Recycled must be between 0 and total waste.';
            isValid = false;
        }
        
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        
        if (validate()) {
            const emissionFactors = {
                energy: 0.233,
                travel: 0.12,
                fuel: {
                    petrol: 2.31,
                    diesel: 2.68,
                    electric: 0.0,
                    naturalGas: 2.75
                },
                waste: 0.1
            };
    
            let totalEmissions = 0;

            const nonRenewableEnergy = 100 - (formData.renewableEnergyUsage ? parseFloat(formData.renewableEnergyUsage) : 0);
            totalEmissions += (parseFloat(formData.energyConsumption) || 0) * (nonRenewableEnergy / 100) * emissionFactors.energy;
            totalEmissions += (parseFloat(formData.distanceTraveled) || 0) * emissionFactors.travel;
            totalEmissions += (parseFloat(formData.fuelConsumption) || 0) * (emissionFactors.fuel[formData.fuelType] || 0);
            const nonRecycledWaste = (parseFloat(formData.totalWasteProduced) || 0) - (parseFloat(formData.wasteRecycled) || 0);
            totalEmissions += nonRecycledWaste * emissionFactors.waste;

            setTotalEmissions(totalEmissions);
            const user = auth.currentUser; 
            if (user && user.email) {
                try {
                    const sanitizedEmail = user.email.replace(/[.+]/g, '_');
                    const userDocRef = doc(firestore, 'carbonData', sanitizedEmail);
                    const userDoc = await getDoc(userDocRef);
                    let carbonCredits = userDoc.exists() ? userDoc.data().carbonCredits : 0;                    
                    let previousTotalEmissions = 0;
                    if (userDoc.exists() && userDoc.data().submissions.length > 0) {
                        previousTotalEmissions = parseFloat(userDoc.data().submissions[userDoc.data().submissions.length - 1].totalEmissions);
                        const emissionsDifference = Math.max(0, previousTotalEmissions - totalEmissions); // reward for reducing emissions
                        carbonCredits += Math.floor(emissionsDifference / 10);
                    }

                    const payload = {
                        businessName: formData.businessName,
                        address: formData.address,
                        industryType: formData.industryType,
                        totalEmissions,
                    };
                    
                    const genAI = new GoogleGenerativeAI("AIzaSyA528kfAXpGqd_mamOSwRHIm47oyqwZb-U");
                    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
                    const prompt = `(summarise the content within 200-250 words) Given the following business data, suggest a phase wise implementation carbon reduction strategy: ${JSON.stringify(payload)}`;
                    const result = await model.generateContentStream(prompt);
                    
                    let strategy = '';
                    for await (const chunk of result.stream) {
                        strategy += await chunk.text();
                    }
                    setReductionStrategy(strategy);

                    await setDoc(userDocRef, {
                        submissions: arrayUnion({
                            ...formData,
                            totalEmissions: totalEmissions.toFixed(2),
                            strategy,
                            createdAt: new Date(),
                        }),
                        carbonCredits,
                    }, { merge: true });

                    setCarbonCredits(carbonCredits);
                    setSubmissionStatus('Form submitted successfully!');
                } catch (error) {
                    console.error('Error adding document to Firebase: ', error);
                    setSubmissionStatus('Error submitting the form. Please try again.');
                }
            } else {
                console.error('No user is logged in. Cannot submit data.');
                setSubmissionStatus('You must be logged in to submit data.');
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="flex justify-center items-start min-h-screen bg-gradient-to-r from-green-400 to-blue-500 p-4">
            <div className="flex flex-col bg-white p-8 rounded-lg shadow-lg w-full max-w-xl mr-4 transition-transform duration-300 ease-in-out" style={{ transform: reductionStrategy ? 'translateX(-20px)' : 'translateX(0)' }}>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Carbon Footprint Calculator</h1>
                <div className="overflow-y-auto max-h-[70vh] p-4">
                    <form onSubmit={handleSubmit}>
                        <h2 className="text-lg font-semibold mb-4">Section 1: Business Information</h2>
                        <label htmlFor="businessName" className="block mb-1 font-medium">Business Name*</label>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.businessName && <p className="text-red-600 text-sm">{errors.businessName}</p>}
                        
                        <label htmlFor="address" className="block mb-1 font-medium">Address*</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.address && <p className="text-red-600 text-sm">{errors.address}</p>}
        
                        <label htmlFor="industryType" className="block mb-1 font-medium">Industry Type*</label>
                        <input type="text" name="industryType" value={formData.industryType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.industryType && <p className="text-red-600 text-sm">{errors.industryType}</p>}
        
                        <label htmlFor="energyConsumption" className="block mb-1 font-medium">Energy Consumption (kWh)*</label>
                        <input type="number" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.energyConsumption && <p className="text-red-600 text-sm">{errors.energyConsumption}</p>}
        
                        <label htmlFor="renewableEnergyUsage" className="block mb-1 font-medium">Renewable Energy Usage (%)</label>
                        <input type="number" name="renewableEnergyUsage" value={formData.renewableEnergyUsage} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.renewableEnergyUsage && <p className="text-red-600 text-sm">{errors.renewableEnergyUsage}</p>}
        
                        <label htmlFor="distanceTraveled" className="block mb-1 font-medium">Distance Traveled (km)*</label>
                        <input type="number" name="distanceTraveled" value={formData.distanceTraveled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.distanceTraveled && <p className="text-red-600 text-sm">{errors.distanceTraveled}</p>}
        
                        <label htmlFor="fuelType" className="block mb-1 font-medium">Type of Fuel Used*</label>
                        <select name="fuelType" value={formData.fuelType} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4">
                            <option value="petrol">Petrol</option>
                            <option value="diesel">Diesel</option>
                            <option value="electric">Electric</option>
                            <option value="naturalGas">Natural Gas</option>
                        </select>
                        {errors.fuelType && <p className="text-red-600 text-sm">{errors.fuelType}</p>}
        
                        <label htmlFor="fuelConsumption" className="block mb-1 font-medium">Fuel Consumption (L)*</label>
                        <input type="number" name="fuelConsumption" value={formData.fuelConsumption} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.fuelConsumption && <p className="text-red-600 text-sm">{errors.fuelConsumption}</p>}
        
                        <label htmlFor="totalWasteProduced" className="block mb-1 font-medium">Total Waste Produced (kg)*</label>
                        <input type="number" name="totalWasteProduced" value={formData.totalWasteProduced} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.totalWasteProduced && <p className="text-red-600 text-sm">{errors.totalWasteProduced}</p>}
        
                        <label htmlFor="wasteRecycled" className="block mb-1 font-medium">Waste Recycled (kg)</label>
                        <input type="number" name="wasteRecycled" value={formData.wasteRecycled} onChange={handleChange} className="border border-gray-300 p-2 rounded-lg w-full mb-4" />
                        {errors.wasteRecycled && <p className="text-red-600 text-sm">{errors.wasteRecycled}</p>}
        
                        <button type="submit" className="bg-green-600 text-white p-2 rounded-lg w-full">{isLoading ? 'Submitting...' : 'Submit'}</button>
                    </form>
                </div>
                {submissionStatus && <p className="mt-4 text-center">{submissionStatus}</p>}
                {totalEmissions !== null && (
                    <div className="mt-4">
                        <h3 className="font-semibold">Total Emissions: {totalEmissions.toFixed(2)} kg CO2e  - Total Credits: {carbonCredits}</h3>
                    </div>
                )}
            </div>
            {reductionStrategy && (
                <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-xl h-128 overflow-auto ml-4 transition-transform duration-300 ease-in-out">
                    <h3 className="font-semibold">Recommended Carbon Reduction Strategy:</h3>
                    <MarkdownRenderer content={reductionStrategy} />
                </div>
            )}
        </div>
    );
};

export default CarbonForm
