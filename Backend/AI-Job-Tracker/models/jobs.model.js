import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
title: String,
company: String,
location: String,
skills:[],
description: String,
appliedUser: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
salary: String,
});

export const Job = mongoose.model('job', jobSchema);