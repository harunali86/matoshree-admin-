'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Truck, IndianRupee, Trash2 } from 'lucide-react';

interface Zone {
    id: string;
    pincode: string;
    city: string;
    delivery_fee: number;
    cod_available: boolean;
    delivery_days: number;
}

export default function ZonesPage() {
    const [zones, setZones] = useState<Zone[]>([
        { id: '1', pincode: '411062', city: 'Talwade, Pune', delivery_fee: 0, cod_available: true, delivery_days: 2 },
        { id: '2', pincode: '411057', city: 'Chikhali, Pune', delivery_fee: 0, cod_available: true, delivery_days: 2 },
        { id: '3', pincode: '411033', city: 'Nigdi, Pune', delivery_fee: 49, cod_available: true, delivery_days: 3 },
        { id: '4', pincode: '411014', city: 'Kothrud, Pune', delivery_fee: 49, cod_available: true, delivery_days: 3 },
        { id: '5', pincode: '400001', city: 'Mumbai', delivery_fee: 99, cod_available: false, delivery_days: 5 },
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [form, setForm] = useState({ pincode: '', city: '', delivery_fee: '0', cod_available: true, delivery_days: '3' });

    const handleAdd = () => {
        setZones([
            ...zones,
            {
                id: Date.now().toString(),
                pincode: form.pincode,
                city: form.city,
                delivery_fee: parseInt(form.delivery_fee) || 0,
                cod_available: form.cod_available,
                delivery_days: parseInt(form.delivery_days) || 3,
            }
        ]);
        setForm({ pincode: '', city: '', delivery_fee: '0', cod_available: true, delivery_days: '3' });
        setIsOpen(false);
    };

    const handleDelete = (id: string) => {
        if (!confirm('Remove this zone?')) return;
        setZones(zones.filter(z => z.id !== id));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">Delivery Zones</h1>
                    <p className="text-gray-500 mt-1">Manage serviceable pincodes and delivery charges</p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg">
                            <Plus size={18} className="mr-2" /> Add Zone
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add Delivery Zone</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 mt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Pincode</label>
                                    <Input
                                        placeholder="411062"
                                        value={form.pincode}
                                        onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-2">City/Area</label>
                                    <Input
                                        placeholder="Talwade, Pune"
                                        value={form.city}
                                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium block mb-2">Delivery Fee (₹)</label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={form.delivery_fee}
                                        onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-2">Delivery Days</label>
                                    <Input
                                        type="number"
                                        placeholder="3"
                                        value={form.delivery_days}
                                        onChange={(e) => setForm({ ...form, delivery_days: e.target.value })}
                                    />
                                </div>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.cod_available}
                                    onChange={(e) => setForm({ ...form, cod_available: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <span className="text-sm">COD Available</span>
                            </label>
                            <Button onClick={handleAdd} className="w-full bg-gray-900">
                                Add Zone
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-blue-500 rounded-xl">
                            <MapPin size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{zones.length}</p>
                            <p className="text-sm text-gray-600">Serviceable Zones</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-green-500 rounded-xl">
                            <Truck size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{zones.filter(z => z.delivery_fee === 0).length}</p>
                            <p className="text-sm text-gray-600">Free Delivery Zones</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl flex items-center gap-4">
                        <div className="p-3 bg-purple-500 rounded-xl">
                            <IndianRupee size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{zones.filter(z => z.cod_available).length}</p>
                            <p className="text-sm text-gray-600">COD Available</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Table */}
            <Card className="border-0 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <TableHead className="font-semibold">Pincode</TableHead>
                                <TableHead className="font-semibold">City/Area</TableHead>
                                <TableHead className="font-semibold">Delivery Fee</TableHead>
                                <TableHead className="font-semibold">Days</TableHead>
                                <TableHead className="font-semibold">COD</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {zones.map((zone) => (
                                <TableRow key={zone.id} className="hover:bg-gray-50/50">
                                    <TableCell className="font-mono font-semibold">{zone.pincode}</TableCell>
                                    <TableCell>{zone.city}</TableCell>
                                    <TableCell>
                                        {zone.delivery_fee === 0 ? (
                                            <Badge className="bg-green-100 text-green-700">FREE</Badge>
                                        ) : (
                                            <span>₹{zone.delivery_fee}</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{zone.delivery_days} days</TableCell>
                                    <TableCell>
                                        <Badge className={zone.cod_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                            {zone.cod_available ? 'Yes' : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="ghost" className="text-red-600" onClick={() => handleDelete(zone.id)}>
                                            <Trash2 size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
