import { getCountries } from "@/app/_lib/data-service";

// Let's imagine your colleague already built this component 😃

async function SelectCountry({ defaultCountry, name, id, className }) {
  const countries = await getCountries();
  console.log(countries);
  if (!Array.isArray(countries)) {
    console.error("Countries data is not an array:", countries);
    return null;
  }
  const flag =
    countries.find((country) => country.name.common === defaultCountry)?.flags
      .svg ?? "";

  console.log(`flag is ${flag}`);
  return (
    <select
      name={name}
      id={id}
      // Here we use a trick to encode BOTH the country name and the flag into the value. Then we split them up again later in the server action
      defaultValue={`${defaultCountry}%${flag}`}
      className={className}
    >
      <option value="">Select country...</option>
      {countries.map((c) => (
        <option key={c.name.common} value={`${c.name.common}%${c.flags.svg}`}>
          {c.name.common}
        </option>
      ))}
    </select>
  );
}

export default SelectCountry;
