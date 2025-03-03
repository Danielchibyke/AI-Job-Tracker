import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
title: String,
company: String,
salary: String,
});

export const Job = mongoose.model('job', jobSchema);