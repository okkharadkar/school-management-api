const express = require('express');
const router = express.Router();
const db = require('../db');

const Distance = (coords1, coords2) => {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const R = 6371;
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lon - coords1.lon);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(coords1.lat)) * Math.cos(toRad(coords2.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};


router.post('/addSchool', (req, res) => {
    const { name, address, latitude, longitude } = req.body;

    if (!name || !address || typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ error: 'Enter Invalid input data' });
    }

    const sql = 'INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, address, latitude, longitude], (err, result) => {
        if (err) throw err;
        res.status(201).json({ message: 'School added successfully in the DB...!', schoolId: result.insertId });
    });
});

router.get('/listSchools', (req, res) => {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude || isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        return res.status(400).json({ error: 'Invalid latitude or longitude' });
    }

    const sql = 'SELECT * FROM schools';
    db.query(sql, (err, results) => {
        if (err) throw err;

        results.forEach(school => {
            school.distance = Distance(
                { lat: parseFloat(latitude), lon: parseFloat(longitude) },
                { lat: school.latitude, lon: school.longitude }
            );
        });

        results.sort((a, b) => a.distance - b.distance);

        res.json(results);
    });
});

module.exports = router;
