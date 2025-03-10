"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

function Filter() {
  const searchParams = useSearchParams(); //example: {capacity: "small"} or {capacity: "small", page: "2"} or {page: "2"}
  const router = useRouter(); //example: {pathname: "/cabins", search: "?capacity=small", hash: "", state: undefined, key: "cabins"}
  const pathname = usePathname(); //example: /cabins

  const activeFilter = searchParams.get("capacity") ?? "all"; //

  //   console.log("searchParams", searchParams);
  //   console.log("router", router);
  //   console.log("pathname", pathname);
  //   console.log("activeFilter", activeFilter);

  function handleFilter(filter) {
    // CHANGE
    const params = new URLSearchParams(searchParams); //example: ?capacity=small
    params.set("capacity", filter);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false }); //example: /cabins?capacity=small

    // console.log("params", params);
    // console.log("router", router);
  }
  return (
    <div className="border border-primary-800 flex">
      <Button
        filter="all"
        activeFilter={activeFilter}
        handleFilter={handleFilter}
      >
        All
      </Button>
      <Button
        filter="small"
        activeFilter={activeFilter}
        handleFilter={handleFilter}
      >
        1&mdash;3 guests
      </Button>

      <Button
        filter="medium"
        activeFilter={activeFilter}
        handleFilter={handleFilter}
      >
        4&mdash;7 guests
      </Button>
      <Button
        filter="large"
        activeFilter={activeFilter}
        handleFilter={handleFilter}
      >
        8&mdash;12 guesmall
      </Button>
    </div>
  );
}

export default Filter;

function Button({ filter, handleFilter, activeFilter, children }) {
  return (
    <button
      className={`"hover:bg-primary-700 px-5 py-2 rounded-lg ${
        filter === activeFilter ? "bg-primary-700 text-primary-50" : ""
      }`}
      onClick={() => handleFilter(filter)}
    >
      {children}
    </button>
  );
}
