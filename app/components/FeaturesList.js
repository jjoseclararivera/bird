// components/FeaturesList.js
const FeaturesList = (features) => {  
    return (
        <ul>
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
    );
  };
  
  export default FeaturesList;
  