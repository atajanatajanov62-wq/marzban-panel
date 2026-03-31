import {
  Box,
  BoxProps,
  Button,
  chakra,
  Grid,
  GridItem,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Spinner,
} from "@chakra-ui/react";
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useDashboard } from "contexts/DashboardContext";
import debounce from "lodash.debounce";
import React, { FC, useState } from "react";
import { useTranslation } from "react-i18next";

const SearchIcon = chakra(MagnifyingGlassIcon, { baseStyle: { w: 4, h: 4 } });
const ClearIcon = chakra(XMarkIcon, { baseStyle: { w: 4, h: 4 } });
export const ReloadIcon = chakra(ArrowPathIcon, { baseStyle: { w: 4, h: 4 } });

const glassInput = {
  bg: "var(--px-glass-bg, rgba(255,255,255,0.5))",
  borderColor: "var(--px-border, rgba(0,0,0,0.1))",
  color: "var(--px-text)",
  _placeholder: { color: "var(--px-text-muted)" },
  _hover: { borderColor: "var(--px-accent, rgba(99,102,241,0.4))" },
  _focus: { borderColor: "var(--px-accent)", boxShadow: "none", bg: "rgba(255,255,255,0.7)" },
  borderRadius: "10px",
};

export type FilterProps = {} & BoxProps;

const setSearchField = debounce((search: string) => {
  useDashboard.getState().onFilterChange({
    ...useDashboard.getState().filters,
    offset: 0,
    search,
  });
}, 300);

export const Filters: FC<FilterProps> = ({ ...props }) => {
  const { loading, filters, onFilterChange, refetchUsers, onCreateUser } = useDashboard();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSearchField(e.target.value);
  };

  const clear = () => {
    setSearch("");
    onFilterChange({ ...filters, offset: 0, search: "" });
  };

  return (
    <Grid
      id="filters"
      templateColumns={{ lg: "1fr 200px auto auto", md: "1fr 160px auto auto", base: "1fr auto" }}
      position="sticky"
      top="62px"
      mx="-6"
      px="6"
      rowGap={3}
      gap={{ lg: 3, base: 2 }}
      bg="var(--px-filters-bg, rgba(255,255,255,0.92))"
      backdropFilter="blur(16px)"
      py={3}
      zIndex="docked"
      borderBottom="1px solid var(--px-border, rgba(0,0,0,0.08))"
      {...props}
    >
      <GridItem colSpan={{ base: 1, md: 1 }}>
        <InputGroup>
          <InputLeftElement pointerEvents="none" children={<SearchIcon color="var(--px-text-muted)" />} />
          <Input
            placeholder={t("search")}
            value={search}
            onChange={onChange}
            sx={glassInput}
          />
          <InputRightElement>
            {loading && <Spinner size="xs" color="primary.400" />}
            {filters.search && filters.search.length > 0 && !loading && (
              <IconButton
                onClick={clear}
                aria-label="clear"
                size="xs"
                variant="ghost"
                color="var(--px-text-muted)"
                _hover={{ color: "var(--px-text)" }}
              >
                <ClearIcon />
              </IconButton>
            )}
          </InputRightElement>
        </InputGroup>
      </GridItem>

      <GridItem display={{ base: "none", md: "block" }}>
        <Select
          sx={{
            ...glassInput,
            option: { bg: "var(--px-option-bg)", color: "var(--px-text)" },
          }}
          size="md"
          defaultValue=""
        >
          <option value="">All Admins</option>
          <option value="admin">admin</option>
          <option value="sudo">sudo</option>
        </Select>
      </GridItem>

      <GridItem display={{ base: "none", md: "flex" }} alignItems="center">
        <IconButton
          aria-label="refresh users"
          disabled={loading}
          onClick={refetchUsers}
          size="sm"
          variant="outline"
          sx={{
            borderColor: "var(--px-border)",
            color: "var(--px-text-muted)",
            _hover: { borderColor: "var(--px-accent)", color: "var(--px-text)", bg: "var(--px-hover-bg)" },
            borderRadius: "10px",
          }}
        >
          <ReloadIcon className={classNames({ "animate-spin": loading })} />
        </IconButton>
      </GridItem>

      <GridItem display="flex" alignItems="center">
        <Button
          colorScheme="primary"
          size="sm"
          onClick={() => onCreateUser(true)}
          px={5}
          borderRadius="10px"
          bg="primary.600"
          _hover={{ bg: "primary.500" }}
        >
          {t("createUser")}
        </Button>
      </GridItem>
    </Grid>
  );
};
