import { useState, createElement } from 'react';
import Select, { components } from 'react-select';
import { Ukraine } from '../flags/ukraine';
import { UnitedArabEmirates } from '../flags/unitedarabemirates';
import { UnitedKingdom } from '../flags/unitedkingdom';
import { UnitedStates } from '../flags/unitedstates';
import { Chevron } from '../svg/chevron';

const options = [
  { value: 'UR', label: 'Ukraine', icon: Ukraine },
  {
    value: 'UA',
    label: 'United Arab Emirates',
    icon: UnitedArabEmirates,
  },
  { value: 'UK', label: 'United Kingdom', icon: UnitedKingdom },
  { value: 'US', label: 'United States', icon: UnitedStates },
];

/**
 * CountrySelector component
 * A customized <select> style component for international phone numbers
 * @returns A country selector component
 */

export default function CountrySelector() {
  const [country, setCountry] = useState(options[0]);

  const handleSetCountry = (e: any) => {
    setCountry(e);
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
      defaultMenuIsOpen
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
}
