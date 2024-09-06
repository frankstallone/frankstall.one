import { useState, createElement } from 'react';
import Select, { components } from 'react-select';
import { Ukraine } from '../flags/ukraine';
import { UnitedArabEmirates } from '../flags/unitedarabemirates';
import { UnitedKingdom } from '../flags/unitedkingdom';
import { UnitedStates } from '../flags/unitedstates';
import { Chevron } from '../svg/chevron';

interface CountrySelectorProps {
  updateTemplate: (value: string) => void;
}

const options = [
  { value: 'UA', label: 'Ukraine', icon: Ukraine },
  {
    value: 'AE',
    label: 'United Arab Emirates',
    icon: UnitedArabEmirates,
  },
  { value: 'GB', label: 'United Kingdom', icon: UnitedKingdom },
  { value: 'US', label: 'United States', icon: UnitedStates },
];

/**
 * CountrySelector component
 * A customized <select> style component for international phone numbers
 * @returns A country selector component
 */

const CountrySelector: React.FC<CountrySelectorProps> = ({
  updateTemplate,
}) => {
  const [country, setCountry] = useState(options[3]);

  const handleSetCountry = (e: any) => {
    setCountry(e);
    updateTemplate(e.value);
  };

  // TODO: Not working
  const DownChevron = (props: any) => (
    <components.DownChevron {...props}>
      {createElement(Chevron)}
    </components.DownChevron>
  );

  const SingleValue = (props: any) => (
    <components.SingleValue {...props}>
      {createElement(country.icon)}
    </components.SingleValue>
  );

  const Option = (props: any) => (
    <components.Option {...props}>
      {createElement(props.data.icon)} {props.data.label}
    </components.Option>
  );

  return (
    <Select
      unstyled
      defaultValue={country}
      options={options}
      onChange={handleSetCountry}
      className="country-selector"
      classNamePrefix="country-selector"
      classNames={{
        control: (state) =>
          state.isFocused ? 'country-selector__focused' : '',
      }}
      isSearchable={false}
      components={{
        Option,
        DownChevron,
        SingleValue,
      }}
    />
  );
};
export default CountrySelector;
