import React, { useState } from 'react';
import { X, Plus, Trash2, Tag, Palette } from 'lucide-react';

const colors = [
    '#2eaadc', '#e16259', '#dfab01', '#0b6e99', '#69314c',
    '#ac5b51', '#4d4d4d', '#000000', '#2563eb', '#16a34a'
];

const CategoryManager = ({ isOpen, onClose, categories, onAdd, onDelete, onUpdate }) => {
    const [newName, setNewName] = useState('');
    const [newType, setNewType] = useState('expense');
    const [newColor, setNewColor] = useState(colors[0]);

    if (!isOpen) return null;

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newName) return;
        onAdd({ name: newName, type: newType, color: newColor });
        setNewName('');
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
            <div className="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Manage Categories</h2>
                    <button onClick={onClose} className="text-secondary hover:text-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-auto space-y-2 pr-2 mb-6">
                    {categories.length === 0 ? (
                        <p className="text-center text-secondary text-sm py-8">No custom categories yet.</p>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border group">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: cat.color }}
                                    />
                                    <div>
                                        <p className="text-sm font-medium">{cat.name}</p>
                                        <p className="text-[10px] text-secondary uppercase font-bold">{cat.type}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => onDelete(cat.id)}
                                    className="text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Add Form */}
                <form onSubmit={handleAdd} className="border-t border-border pt-6 space-y-4">
                    <p className="text-xs font-bold text-secondary uppercase tracking-wider">Add New Category</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            className="bg-muted/30 border border-border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary col-span-2 md:col-span-1"
                            placeholder="Category Name"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                        />
                        <select
                            className="bg-muted/30 border border-border rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary col-span-2 md:col-span-1"
                            value={newType}
                            onChange={e => setNewType(e.target.value)}
                        >
                            <option value="expense">Expense</option>
                            <option value="income">Income</option>
                            <option value="task">Task</option>
                        </select>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {colors.map(c => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setNewColor(c)}
                                className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${newColor === c ? 'border-foreground' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-2 rounded-md font-medium text-sm mt-2 hover:opacity-90 flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        Add Category
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CategoryManager;
