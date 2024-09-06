import { useState, createElement } from 'react';
import Select, { components } from 'react-select';
import { Chevron } from '@ui/svg/chevron';
// https://nucleoapp.com/svg-flag-icons
import { Ukraine } from '@ui/flags/ukraine';
import { UnitedArabEmirates } from '@ui/flags/unitedarabemirates';
import { UnitedKingdom } from '@ui/flags/unitedkingdom';
import { UnitedStates } from '@ui/flags/unitedstates';
import { Uruguay } from '@ui/flags/uruguay';
import { Uzbekistan } from '@ui/flags/uzbekistan';
import { Venezuela } from '@ui/flags/venezuela';
import { Vietnam } from '@ui/flags/vietnam';
import { Yemen } from '@ui/flags/yemen';
import { Zambia } from '@ui/flags/zambia';
import { Zimbabwe } from '@ui/flags/zimbabwe';

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
  { value: 'UY', label: 'Uruguay', icon: Uruguay },
  { value: 'UZ', label: 'Uzbekistan', icon: Uzbekistan },
  { value: 'VE', label: 'Venezuela', icon: Venezuela },
  { value: 'VN', label: 'Vietnam', icon: Vietnam },
  { value: 'YE', label: 'Yemen', icon: Yemen },
  { value: 'ZM', label: 'Zambia', icon: Zambia },
  { value: 'ZW', label: 'Zimbabwe', icon: Zimbabwe },
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

  // This does not work: https://github.com/JedWatson/react-select/issues/3739
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
