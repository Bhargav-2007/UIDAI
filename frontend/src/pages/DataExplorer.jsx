import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const DataExplorer = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataset, setDataset] = useState('enrolment');

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await api.rawData(dataset);
            setData(response.data || []);
        } catch (e) {
            console.error("Data fetch error", e);
            setError("Failed to load raw data from secure explorer endpoint.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [dataset]);

    const getColumns = () => {
        if (dataset === 'enrolment') {
            return ['id', 'date', 'state', 'district', 'sub_district', 'gender', 'total_enrolments'];
        } else if (dataset === 'demographic') {
            return ['id', 'date', 'state', 'district', 'demo_gender', 'total_demo_updates'];
        } else {
            return ['id', 'date', 'state', 'district', 'bio_auth', 'total_bio_updates'];
        }
    };

    return (
        <div className="flex flex-col gap-8 fade-in">
            <div className="flex justify-between items-end border-b border-[#002147]/10 pb-6">
                <div>
                    <h2 className="text-4xl font-serif font-bold text-[#002147] mb-2">Data Repository</h2>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Raw Record Inspection & Secure Audit Trail</p>
                </div>
                <div className="flex gap-2">
                    {['enrolment', 'demographic', 'biometric'].map(ds => (
                        <button
                            key={ds}
                            onClick={() => setDataset(ds)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${dataset === ds
                                ? 'bg-[#c5a059] text-[#002147] shadow-md'
                                : 'bg-white border border-[#002147]/10 text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            {ds}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white border border-[#002147]/10 rounded shadow-sm overflow-hidden">
                <div className="p-6 border-b border-[#002147]/10 bg-slate-50/50 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                        <h3 className="font-serif font-bold text-[#002147]">Secure Transaction Log: {dataset.toUpperCase()}</h3>
                    </div>
                    <button className="px-6 py-2 bg-[#002147] hover:bg-[#c5a059] hover:text-[#002147] text-white text-[10px] font-bold uppercase tracking-widest rounded transition-all">
                        Request Export (CSV)
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-[#002147] text-white uppercase text-[10px] font-bold tracking-widest">
                            <tr>
                                {getColumns().map(col => (
                                    <th key={col} className="px-6 py-4">{col.replace(/_/g, ' ')}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan={getColumns().length} className="px-6 py-20 text-center text-slate-400 italic">Authenticating and retrieving secure records...</td></tr>
                            ) : error ? (
                                <tr><td colSpan={getColumns().length} className="px-6 py-20 text-center text-red-500 font-bold">{error}</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan={getColumns().length} className="px-6 py-20 text-center text-slate-400">No records found for the selected dataset.</td></tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        {getColumns().map(col => (
                                            <td key={col} className={`px-6 py-4 ${col === 'id' ? 'font-mono text-[10px] text-[#c5a059] font-bold' : 'text-slate-600'}`}>
                                                {row[col] !== undefined ? String(row[col]) : '—'}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <div>Records Loaded: {data.length} (Sample Subset)</div>
                    <div className="flex gap-4">
                        <button className="hover:text-[#002147] transition-colors disabled:opacity-30" disabled>Previous Page</button>
                        <div className="w-px h-4 bg-slate-200"></div>
                        <button className="hover:text-[#002147] transition-colors disabled:opacity-30" disabled>Next Page</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataExplorer;
