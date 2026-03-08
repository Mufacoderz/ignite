const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const authCtrl = require('../controllers/authController');
const exerciseCtrl = require('../controllers/exerciseController');
const planCtrl = require('../controllers/planController');
const checklistCtrl = require('../controllers/checklistController');
const statsCtrl = require('../controllers/statsController');

// Auth routes
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', auth, authCtrl.getMe);

// Exercise routes
router.get('/exercises', auth, exerciseCtrl.getAll);
router.get('/exercises/:id', auth, exerciseCtrl.getOne);
router.post('/exercises', auth, exerciseCtrl.create);
router.put('/exercises/:id', auth, exerciseCtrl.update);
router.delete('/exercises/:id', auth, exerciseCtrl.remove);

// Plan routes
router.get('/plans', auth, planCtrl.getAll);
router.get('/plans/:id', auth, planCtrl.getOne);
router.post('/plans', auth, planCtrl.create);
router.put('/plans/:id', auth, planCtrl.update);
router.delete('/plans/:id', auth, planCtrl.remove);

// Checklist routes
router.get('/checklist', auth, checklistCtrl.getByDate);
router.post('/checklist/start', auth, checklistCtrl.startPlan);
router.patch('/checklist/exercise/:logExerciseId', auth, checklistCtrl.toggleExercise);
router.get('/checklist/history', auth, checklistCtrl.getHistory);

// Stats routes
router.get('/stats/overview', auth, statsCtrl.getOverview);
router.get('/stats/weekly', auth, statsCtrl.getWeekly);
router.get('/stats/monthly', auth, statsCtrl.getMonthly);
router.get('/stats/categories', auth, statsCtrl.getCategoryBreakdown);

module.exports = router;
