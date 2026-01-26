import React, { useState, useEffect, useRef } from 'react';
import {
    FileText,
    Image,
    File,
    MoreVertical,
    Search,
    UploadCloud,
    Folder,
    Grid,
    List,
    Trash2,
    Loader2
} from 'lucide-react';

const FileIcon = ({ type }) => {
    switch (type.toLowerCase()) {
        case 'pdf': return <FileText className="text-red-500" size={32} strokeWidth={1.5} />;
        case 'doc':
        case 'docx': return <FileText className="text-blue-500" size={32} strokeWidth={1.5} />;
        case 'zip': return <Folder className="text-yellow-500" size={32} strokeWidth={1.5} />;
        case 'img':
        case 'png':
        case 'jpg':
        case 'jpeg': return <Image className="text-purple-500" size={32} strokeWidth={1.5} />;
        default: return <File className="text-gray-400" size={32} strokeWidth={1.5} />;
    }
};

const DocumentManager = () => {
    const [docs, setDocs] = useState([]);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const token = localStorage.getItem('token');

    const fetchDocs = async () => {
        try {
            const res = await fetch('/api/documents', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setDocs(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchDocs();
    }, [token]);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', filter === 'All' ? 'General' : filter);

        try {
            const res = await fetch('/api/documents/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });
            if (res.ok) {
                const newDoc = await res.json();
                setDocs([newDoc, ...docs]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
            e.target.value = null;
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this document?')) return;
        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDocs(docs.filter(d => d.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const filteredDocs = docs.filter(doc => {
        const matchesFilter = filter === 'All' || doc.category === filter;
        const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const categories = ['All', 'Work', 'Finance', 'Personal'];

    return (
        <div className="p-6 md:p-10 space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Documents</h1>
                </div>
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleUpload}
                />
                <button
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md font-medium transition-all text-sm shadow-sm disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin" size={16} /> : <UploadCloud size={16} />}
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-1 bg-muted/50 p-1 rounded-md">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1.5 rounded text-xs font-medium transition-all
                ${filter === cat
                                    ? 'bg-white text-primary shadow-sm'
                                    : 'text-secondary hover:text-foreground hover:bg-black/5'
                                }
              `}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="relative w-full md:w-auto">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 bg-white border border-border rounded-md text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none w-full md:w-64 placeholder:text-secondary shadow-sm"
                    />
                </div>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 flex justify-center">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    filteredDocs.map((doc) => (
                        <div key={doc.id} className="minimal-card p-4 flex flex-col group cursor-pointer hover:border-primary/30 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-muted/30 rounded-md">
                                    <FileIcon type={doc.type} />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(doc.id); }}
                                        className="p-1 text-secondary hover:text-red-500 rounded hover:bg-muted"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <h3 className="font-medium text-foreground truncate text-sm" title={doc.name}>{doc.name}</h3>
                                <div className="flex justify-between items-center mt-1 text-xs text-secondary">
                                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                                    <span>{doc.size}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {!loading && filteredDocs.length === 0 && (
                    <div className="col-span-full py-12 text-center text-secondary text-sm bg-muted/20 rounded-lg border border-dashed border-border">
                        <p>No documents found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentManager;
