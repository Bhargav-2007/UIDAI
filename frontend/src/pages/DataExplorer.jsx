import React, { useState, useEffect } from 'react';

const DataExplorer = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app we would fetch this. For demo we simulate structure.
        // However, we DO have a before/raw-data endpoint we could re-use or just mock for grid.
        // Let's use the 'before' endpoint to get some raw data if possible, or simulate.
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/before/raw-data');
                const result = await response.json();
                // The raw-data endpoint returns aggregation, for grid let's simulate enriched rows or use what we can
                // Assuming result.data.daily_trend or similar to populate.
                // Actually, let's mock the "Raw Record View" for security/privacy demonstration.
                const mockRows = Array(20).fill(0).map((_, i) => ({
                    id: `UID-${100000 + i}`,
                    date: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
                    state: ['Maharashtra', 'Delhi', 'Uttar Pradesh', 'Karnataka'][Math.floor(Math.random() * 4)],
                    district: 'Masked',
                    enrolment_type: 'Update',
                    status: 'Completed',
                    integrity_check: Math.random() > 0.9 ? 'FLAGGED' : 'PASS'
                }));
                setData(mockRows);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="p-8 max-w-7xl mx-auto pl-72">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Data Explorer</h1>
                <p className="text-slate-400">Raw data inspection and management.</p>
            </div>

            <div className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden shadow-xl">
                <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-300">Master Enrolment Database</h3>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors flex items-center">
                        <span>⬇️ Export CSV</span>
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-slate-950 text-slate-200 uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Transaction ID</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">State</th>
                                <th className="px-6 py-4">District</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Integrity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-8 text-center animate-pulse">Loading secure records...</td></tr>
                            ) : (
                                data.map((row) => (
                                    <tr key={row.id} className="hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-blue-400">{row.id}</td>
                                        <td className="px-6 py-4">{row.date}</td>
                                        <td className="px-6 py-4">{row.state}</td>
                                        <td className="px-6 py-4 italic text-slate-600">{row.district}</td>
                                        <td className="px-6 py-4">{row.enrolment_type}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-xs border border-emerald-800">{row.status}</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${row.integrity_check === 'FLAGGED' ? 'bg-red-900/30 text-red-400 border border-red-800' : 'bg-slate-800 text-slate-500'}`}>
                                                {row.integrity_check}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-between items-center text-xs text-slate-500">
                    <div>Showing 20 of 1,006,029 records</div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700">Previous</button>
                        <button className="px-3 py-1 bg-slate-800 rounded hover:bg-slate-700">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataExplorer;
