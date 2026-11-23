
import React from "react";

const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];

function DistrictDropdown({
  name = "location",
  value = "",
  onChange,
  required = false,
  placeholder = "Select District",
  className = "",
  disabled = false,
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      disabled={disabled}
      className={className}
    >
      <option value="">{placeholder}</option>

      {districts.map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      ))}
    </select>
  );
}

export default DistrictDropdown;
