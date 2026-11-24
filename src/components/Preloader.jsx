
import React from "react";
import "./Preloader.css";

const Preloader = ({ isLoading }) => {
  return (
    <div
      className={`preloader ${
        isLoading ? "" : "preloader--hide"
      }`}
    >
      <img
        src="/pattajobs-smooth-trace.svg"
        alt="PattaJobs"
        className="preloader-logo"
      />
    </div>
  );
};

export default Preloader;
