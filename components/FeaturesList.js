
import PropTypes from 'prop-types';

const FeaturesList = ({ features }) => {
  return (
    <ul>

      <li>"features[0]"</li>
      <li>"features[1]"</li>

    </ul>
  );
};

FeaturesList.propTypes = {
  features: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default FeaturesList;
