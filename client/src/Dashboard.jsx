
import { useEffect, useState, useRef } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import Toast from './Toast';

function Dashboard({ user, onLogout }) {
    const [readings, setReadings] = useState([]);
    const [reports, setReports] = useState({
        daily: null,
        monthToDate: null,
        previousMonth: null
    });
    const [reading, setReading] = useState('');
    const formRef = useRef(null);
    const [date, setDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('morning_fasting');
    const [editId, setEditId] = useState(null);
    const token = localStorage.getItem('token');
    const [toast, setToast] = useState({
        message: '',
        type: ''
    });
    const showToast = (message, type = 'success') => {
        setToast({ message, type });

        setTimeout(() => {
            setToast({ message: '', type: '' });
        }, 3000);
    };

    const fetchReadings = async () => {
        const response = await fetch('http://localhost:5000/api/readings', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (response.ok) {
            setReadings(data.readings);
        } else {
            showToast(data.message, 'error');
        }
    };

    const fetchReports = async () => {
        try {
            const response = await fetch(
                'http://localhost:5000/api/readings/reports',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (response.ok) {
                setReports(data.reports);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Unable to fetch reports', 'error');
        }
    };

    useEffect(() => {
        fetchReadings();
        fetchReports();
    }, []);


    const handleDelete = async (id) => {
        const response = await fetch(
            `http://localhost:5000/api/readings/${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (response.ok) {
            showToast('Reading deleted successfully!', 'success');
            fetchReadings();
            fetchReports();
        } else {
            showToast(data.message, 'error');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !Number.isInteger(Number(reading)) ||
            Number(reading) < 40 ||
            Number(reading) > 600
        ) {
            showToast('Please enter a valid reading between 40 and 600.', 'error');
            return;
        }

        if (!date || !timeSlot) {
            showToast('Please fill all fields.', 'error');
            return;
        }

        try {
            const response = await fetch(
                editId
                    ? `http://localhost:5000/api/readings/${editId}`
                    : 'http://localhost:5000/api/readings',
                {
                    method: editId ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        reading_value: Number(reading),
                        reading_date: date,
                        time_slot: timeSlot,
                    }),
                });

            const data = await response.json();

            if (!response.ok) {
                showToast(data.message, 'error');

                return;
            }
            showToast(
                editId
                    ? 'Reading updated successfully!'
                    : 'Reading added successfully!',
                'success'
            );
            setDate('');
            setReading('');
            setEditId(null);
            fetchReadings();
        } catch (error) {
            showToast('Unable to connect to server', 'error');
        }
    };

    const today = new Date().toLocaleDateString('en-CA');
    const todayReadings = readings.filter(
        (item) => item.reading_date.slice(0, 10) === today
    );

    const average = readings.length
        ? Math.round(
            readings.reduce((sum, item) => sum + item.reading_value, 0) /
            readings.length
        )
        : '--';

    const chartData = [...readings]
        .sort((a, b) =>
            new Date(a.reading_date) - new Date(b.reading_date)
        )
        .map((item) => ({
            date: `${item.reading_date.slice(0, 10)} - ${item.time_slot.replaceAll('_', ' ')}`,
            glucose: Number(item.reading_value),
        }));
    console.log("Chart Data:", chartData);

    return (
        <div className="container dashboard-page">
            <div className="glow-orb glow-three"></div>
            <div className="glow-orb glow-four"></div>
            <header>
                <h1>Sweety</h1>
                <p>Welcome, {user.name}!</p>
                <button onClick={onLogout}>Logout</button>
            </header>

            <section className="dashboard">
                <div className="card">
                    <h3>Total Readings</h3>
                    <h2>{readings.length}</h2>
                </div>

                <div className="card">
                    <h3>Today's Readings</h3>
                    <h2>{todayReadings.length}</h2>
                </div>

                <div className="card">
                    <h3>Average Glucose</h3>
                    <h2>{average}</h2>
                </div>
            </section>


            <section className="reading-form chart-section">
                <section className="dashboard">
                    {[
                        { title: 'Daily Report', key: 'daily' },
                        { title: 'This Month', key: 'monthToDate' },
                        { title: 'Previous Month', key: 'previousMonth' }
                    ].map(({ title, key }) => {
                        const report = reports[key];

                        return (
                            <div className="card" key={key}>
                                <h3>{title}</h3>
                                <p>Readings: {report?.count ?? '--'}</p>
                                <p>Minimum: {report?.min ?? '--'} mg/dL</p>
                                <p>Maximum: {report?.max ?? '--'} mg/dL</p>
                                <p>Average: {report?.average ?? '--'} mg/dL</p>
                            </div>
                        );
                    })}
                </section>
                <h2>Glucose Trend</h2>

                {chartData.length === 0 ? (
                    <p>No readings available for the chart.</p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                angle={-15}
                                textAnchor="end"
                                height={70}
                                interval={0}
                            />
                            <YAxis
                                domain={['dataMin - 20', 'dataMax + 20']}
                                label={{
                                    value: 'Glucose (mg/dL)',
                                    angle: -90,
                                    position: 'insideLeft',
                                }}
                            />
                            <Tooltip
                                formatter={(value) => [`${value} mg/dL`, 'Glucose']}
                                labelFormatter={(label) => `Date: ${label}`}
                            />
                            <Line
                                type="monotone"
                                dataKey="glucose"
                                stroke="#16866b"
                                strokeWidth={3}
                                strokeLinecap="round"
                                dot={{ r: 5 }}
                                activeDot={{ r: 8 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}
            </section>

            <section className="reading-form" ref={formRef}>
                <h2>Add New Reading</h2>

                <form onSubmit={handleSubmit}>
                    <label>Glucose Level (mg/dL)</label>
                    <input
                        type="number"
                        min="40"
                        max="600"
                        value={reading}
                        placeholder="0"
                        onChange={(e) => setReading(e.target.value)}
                        required
                    />

                    <label>Date</label>
                    <input
                        type="date"
                        max={today}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                    />

                    <label>Time Slot</label>
                    <select
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                    >
                        <option value="morning_fasting">Morning Fasting</option>
                        <option value="after_breakfast">After Breakfast</option>
                        <option value="after_lunch">After Lunch</option>
                        <option value="after_dinner">After Dinner</option>
                    </select>

                    <button type="submit">
                        {editId ? 'Update Reading' : 'Add Reading'}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={() => {
                                setEditId(null);
                                setReading('');
                                setDate('');
                                setTimeSlot('morning_fasting');
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </form>
            </section>

            <section className="reading-form">
                <h2>Your Reading History</h2>

                {readings.length === 0 ? (
                    <p>No readings available.</p>
                ) : (
                    readings.map((item) => (
                        <div className="card" key={item.id}>
                            <h3>{item.reading_value} mg/dL</h3>
                            <p>
                                Date: {item.reading_date.slice(0, 10).split('-').reverse().join('/')}
                            </p>
                            <p>
                                Time: {item.time_slot.replaceAll('_', ' ')}
                            </p>
                            <button onClick={() => {
                                if (window.confirm('Are you sure you want to delete this reading?')) {
                                    handleDelete(item.id);
                                }
                            }}>
                                Delete
                            </button>
                            <button onClick={() => {
                                setEditId(item.id);
                                setReading(item.reading_value);
                                setDate(item.reading_date.slice(0, 10));
                                setTimeSlot(item.time_slot);

                                formRef.current?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                });

                            }}>
                                Edit
                            </button>
                        </div>
                    ))
                )}
            </section>

            <Toast message={toast.message} type={toast.type} />

        </div>
    );
}

export default Dashboard;
