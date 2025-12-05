import express from 'express';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static files (for the test page)
app.use(express.static(path.join(__dirname, 'views')));

// Universal Form Endpoint
app.post('/submit/:formId', async (req, res) => {
    const { formId } = req.params;
    const formData = req.body;
    const dbUri = process.env.DATABASE_URI;

    console.log(`[Static Submission] Form ID: ${formId}`);
    console.log('Data:', formData);

    if (!dbUri) {
        return res.status(500).json({ error: 'DATABASE_URI not configured' });
    }

    try {
        // Simple routing based on URI protocol
        if (dbUri.startsWith('mongodb')) {
            const dbConnect = (await import('../connectors/mongodb')).default;
            await dbConnect();
            // In a real app, we'd save to a generic collection
            console.log('Saved to MongoDB (Simulated)');
        } else if (dbUri.startsWith('postgres') || dbUri.startsWith('postgresql')) {
            const pool = (await import('../connectors/postgres')).default;
            // await pool.query('INSERT INTO submissions ...');
            console.log('Saved to PostgreSQL (Simulated)');
        } else if (dbUri.startsWith('mysql')) {
            const pool = (await import('../connectors/mysql')).default;
            console.log('Saved to MySQL (Simulated)');
        } else if (dbUri.startsWith('scylla')) {
             const { dbConnect } = await import('../connectors/scylladb');
             await dbConnect();
             console.log('Saved to ScyllaDB (Simulated)');
        } else {
            console.log('Unknown DB type, just logging.');
        }

        // Return success
        if (req.accepts('html')) {
            res.send('<h1>Submission Successful</h1><a href="/">Go Back</a>');
        } else {
            res.json({ success: true, message: 'Form submitted successfully' });
        }

    } catch (error: any) {
        console.error('Submission error:', error);
        res.status(500).send(`Error: ${error.message}`);
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'test-static.html'));
});

app.listen(PORT, () => {
    console.log(`Static Server running at http://localhost:${PORT}`);
});
