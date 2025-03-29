import React from "react";
import { useState, useEffect, useContext } from "react";
import "./pagestyles.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthProvider";

export const Dashboard = () => {
  const auth = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([{ title: "loading...", description: "" }]);
  const [expandedId, setExpandedId] = useState(null);
  const [expand, setExpand] = useState("");
  const [searchTerm, setSearchTerm] = useState('');
  const [searchedData, setSearchedData] = useState([{title: ''}])
  //i need to fix user is an empty object
  const navigate = useNavigate();
  useEffect(() => {
    axios
    .get("http://localhost:3000/api/jobs")
    .then((res) => {
      setJobs(res.data);
    })
    .catch(console.log("error fetching jobs"));
    
    setUser(auth.user);
  }, [auth.user, navigate]);
  
  const handleClick = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setExpand(expand === "expanded" ? "" : "expanded");
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);

    setSearchedData(filteredData);
    
  };
  const filteredData = jobs.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleSearchClick = (e)=>{
    console.log(searchedData)

  }
  
  

  return (
    <div id="dashboard">
      <div className="toolBar">
        <ul>
          <li>
            <input
              type="text"
              name="search"
              id="jobsearch"
              placeholder="search job"
              style={{}}
             value={searchTerm}
              onChange={(e)=>{handleSearchChange(e)}}
           
            /> 
            <button  onClick={(e)=>{handleSearchClick(e)}}>search</button>
            <div>
              <ul>
                
                {filteredData.map((item)=>{
                  return (

                  <li
                  key={item._id}
                  >
                    {item.title}
                  </li>
                  )
                })}
              </ul>
             
            </div>
          </li>
          <li>filter</li>
          <li>scrape jobs</li>
        </ul>
      </div>
      <div className="statBar">
        <ul>
          <li>Appllied: 10</li>
          <li>Pending: 3</li>
          <li>Rejected: 1</li>
        </ul>
      </div>
      <div className="dashInterface">
        <div id="joblistingContainer">
          <p>{user ? user.fullname : "loading..."}</p>
          <h1>Job Listings</h1>
          <ul>
            {jobs.map((job) => (
              <li
                key={job.title}
                className={`jobs ${expandedId === job._id ? expand : ""}`}
                onClick={(e) => {
                  console.log(jobs);
                  if (expandedId !== job._id) {
                    handleClick(job._id);
                  }
                }} //only expand, not collapse here
                style={{
                  padding: expandedId === job._id ? "10px" : "",

                  position: expandedId === job._id ? "absolute" : "",
                  top: expandedId === job._id ? 75 : "",
                  left: expandedId === job._id ? -10 : "",
                  overflow: expandedId === job._id ? "auto" : "hidden",
                  width: expandedId === job._id ? "50vw" : "",
                  height: expandedId === job._id ? "97vh" : "",
                  backgroundColor: expandedId === job._id ? "white" : "",
                  zIndex: expandedId === job._id ? 1000 : 0,
                  justifyContent: expandedId === job._id ? "center" : "",
                  alignItems: expandedId === job._id ? "center" : "",
                  // overflow:  expandedId === job._id ? 'hidden': '',
                  flexDirection: expandedId === job._id ? "column" : "",
                  overflowY: expandedId === job._id ? "auto" : "",
                }}
              >
                <button
                  className="closeBtn"
                  onClick={(e) => {
                    handleClick(job._id);
                  }}
                  style={{
                    display: expandedId === job._id ? "block" : "none",
                    position: expandedId === job._id ? "absolute" : "relative",
                  }}
                >
                  close
                </button>
                <div className="title">
                  <span>{job.title}</span>
                </div>
                <div className="company">
                  <span>{job.company}</span>
                </div>
                <div className="location">
                  <span>{job.location}</span>
                </div>
                <div className="skills">
                  <span>{job.skills}</span>
                </div>
                <div className="description">
                  <span>
                    {expandedId === job._id
                      ? job.description
                      : job.description.substring(0, 100) + '...'}
                  </span>
                </div>
                <div
                  className="readmore"
                  style={{ display: expandedId === job._id ? "none" : "block" }}
                >
                  Read more..
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div id="aiAndNotificationContainer">
          <div id="aiservicesContainer">
            <h1>AI Services</h1>
          </div>
          <div id="widgets">
            <div>Applications sent</div>
            <div>Responses received</div>
            <div>Success rate</div>
          </div>
          <div id="notificationContainer">
            <h1> Notifications </h1>
          </div>
        </div>
      </div>
    </div>
  );
};
