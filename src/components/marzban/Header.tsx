import { keyframes } from "@emotion/react";
import {
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import {
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  BanknotesIcon,
  ChartBarIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  DocumentMinusIcon,
  GlobeAltIcon,
  LinkIcon,
  MoonIcon,
  ShieldExclamationIcon,
  SquaresPlusIcon,
  SunIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useDashboard } from "contexts/DashboardContext";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { updateThemeColor } from "utils/themeColor";
import useGetUser from "hooks/useGetUser";
import { ThemePicker } from "./ThemePicker";
import { useTheme } from "contexts/ThemeContext";

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const logoPulse = keyframes`
  0%, 100% { box-shadow: 0 0 14px var(--px-glow); }
  50%       { box-shadow: 0 0 32px var(--px-glow), 0 0 60px rgba(var(--px-accent-rgb),0.15); }
`;
const dotBlink = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.15; }
`;

type HeaderProps = {
  onAdminManager?: () => void;
  onAdminLimits?: () => void;
  onHappCrypto?: () => void;
};

const glassBtn = {
  bg: "var(--px-glass-bg, rgba(255,255,255,0.07))",
  border: "1px solid var(--px-border, rgba(255,255,255,0.12))",
  color: "var(--px-text, white)",
  _hover: { bg: "var(--px-hover-bg, rgba(255,255,255,0.1))" },
  _active: { bg: "var(--px-hover-bg)" },
  borderRadius: "10px",
};

const menuItem = {
  bg: "transparent",
  _hover: { bg: "var(--px-hover-bg, rgba(255,255,255,0.06))" },
  borderRadius: "8px",
  color: "var(--px-text, white)",
  fontSize: "sm",
};

const DONATION_URL = "https://opencollective.com/marzban";
const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "tr", label: "Türkçe" },
  { code: "tk", label: "Türkmençe" },
  { code: "fa", label: "فارسی" },
  { code: "ru", label: "Русский" },
  { code: "zh-cn", label: "中文" },
];

export const Header: FC<HeaderProps> = ({ onAdminManager, onAdminLimits, onHappCrypto }) => {
  const { userData, getUserIsSuccess, getUserIsPending } = useGetUser();
  const isSudo = () =>
    getUserIsPending ? true : getUserIsSuccess ? (userData?.is_sudo ?? true) : true;

  const { onEditingHosts, onResetAllUsage, onEditingNodes, onShowingNodesUsage, version } =
    useDashboard();
  const { t, i18n } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const { currentTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem("token");
    document.cookie = "access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    window.location.href = "/";
  };

  return (
    <HStack
      w="full"
      px={{ base: 4, md: 5 }}
      py={3}
      justifyContent="space-between"
      alignItems="center"
      borderBottom="1px solid var(--px-header-border)"
      bg="var(--px-header-bg)"
      backdropFilter="blur(24px)"
      position="sticky"
      top={0}
      zIndex={100}
    >
      {/* ── Logo + Brand ── */}
      <HStack gap={3} alignItems="center">
        <Box
          w="38px" h="38px"
          bg={`linear-gradient(135deg, ${currentTheme.accent} 0%, ${currentTheme.shimmer[1]}cc 100%)`}
          borderRadius="11px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          css={{ animation: `${logoPulse} 3s ease-in-out infinite` }}
        >
          <Text
            fontWeight="black"
            fontSize={currentTheme.logoText.length > 2 ? "18px" : "14px"}
            color="white"
            letterSpacing="-0.5px"
            lineHeight="1"
          >
            {currentTheme.logoText}
          </Text>
        </Box>

        <Box display={{ base: "none", sm: "block" }}>
          <HStack gap={2} alignItems="center">
            <Text
              fontWeight="black"
              fontSize="15px"
              lineHeight={1}
              letterSpacing="0.02em"
              css={{
                background: `linear-gradient(90deg, ${currentTheme.shimmer[0]} 0%, ${currentTheme.shimmer[1]} 40%, ${currentTheme.shimmer[2]} 60%, ${currentTheme.shimmer[0]} 100%)`,
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: `${shimmer} 3.5s linear infinite`,
              }}
            >
              {currentTheme.brandName}
            </Text>
            <Text fontSize="13px" color="var(--px-text-faint)">|</Text>
            <Text fontSize="13px" color="var(--px-text-muted)" lineHeight={1}>
              {currentTheme.panelName}
            </Text>
            <Box
              w="6px" h="6px"
              bg="#10b981"
              borderRadius="full"
              css={{ animation: `${dotBlink} 2.5s ease-in-out infinite` }}
            />
          </HStack>
          {version && (
            <Text fontSize="10px" color="var(--px-text-faint)" mt="3px">
              v{version}
            </Text>
          )}
        </Box>

        <Text
          display={{ base: "block", sm: "none" }}
          fontWeight="black"
          fontSize="14px"
          css={{
            background: `linear-gradient(90deg, ${currentTheme.shimmer[0]}, ${currentTheme.shimmer[1]})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {currentTheme.brandName}
        </Text>
      </HStack>

      {/* ── Right actions ── */}
      <HStack gap={1.5}>
        <Tooltip label={colorMode === "dark" ? "Light Mode" : "Dark Mode"} placement="bottom" fontSize="xs">
          <IconButton
            aria-label="toggle theme"
            icon={colorMode === "dark" ? <SunIcon width={17} /> : <MoonIcon width={17} />}
            size="sm"
            sx={glassBtn}
            onClick={() => {
              updateThemeColor(colorMode === "dark" ? "light" : "dark");
              toggleColorMode();
            }}
          />
        </Tooltip>

        <Menu placement="bottom-end">
          <Tooltip label="Language" placement="bottom" fontSize="xs">
            <MenuButton
              as={IconButton}
              aria-label="language"
              icon={<GlobeAltIcon width={17} />}
              size="sm"
              sx={glassBtn}
            />
          </Tooltip>
          <MenuList
            bg="var(--px-popover-bg)" border="1px solid var(--px-border)"
            boxShadow="0 8px 32px rgba(0,0,0,0.4)"
            borderRadius="12px" minW="150px" p={1}
          >
            {LANGUAGES.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
                bg="transparent"
                _hover={{ bg: "var(--px-hover-bg)" }}
                borderRadius="8px" fontSize="sm"
                color={i18n.language === lang.code ? currentTheme.accent : "var(--px-text)"}
                fontWeight={i18n.language === lang.code ? "semibold" : "normal"}
              >
                {lang.label}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>

        <Tooltip label="Core Settings" placement="bottom" fontSize="xs">
          <IconButton
            aria-label="core settings"
            icon={<Cog6ToothIcon width={17} />}
            size="sm"
            sx={glassBtn}
            onClick={() => useDashboard.setState({ isEditingCore: true })}
          />
        </Tooltip>

        <ThemePicker />

        <Menu placement="bottom-end">
          <MenuButton
            as={IconButton}
            aria-label="main menu"
            icon={<Bars3Icon width={19} />}
            size="sm"
            sx={{
              ...glassBtn,
              bg: `rgba(${currentTheme.accentRgb},0.18)`,
              borderColor: `rgba(${currentTheme.accentRgb},0.35)`,
              _hover: { bg: `rgba(${currentTheme.accentRgb},0.32)` },
            }}
          />
          <MenuList
            bg="var(--px-popover-bg)" border="1px solid var(--px-border)"
            boxShadow="0 12px 40px rgba(0,0,0,0.5)"
            borderRadius="14px" p={2} minW="215px" zIndex={9999}
          >
            {isSudo() && (
              <>
                <MenuItem icon={<LinkIcon width={14} />} onClick={() => onEditingHosts(true)} {...menuItem}>
                  Host Settings
                </MenuItem>
                <MenuItem icon={<SquaresPlusIcon width={14} />} onClick={() => onEditingNodes(true)} {...menuItem}>
                  Node Settings
                </MenuItem>
                <MenuItem icon={<ChartPieIcon width={14} />} onClick={() => onShowingNodesUsage(true)} {...menuItem}>
                  Nodes Usage
                </MenuItem>
                <MenuItem icon={<DocumentMinusIcon width={14} />} onClick={() => onResetAllUsage(true)} {...menuItem}>
                  Reset All Usages
                </MenuItem>
                <MenuDivider borderColor="var(--px-border)" />
                <MenuItem icon={<ShieldExclamationIcon width={14} />} onClick={onAdminLimits} {...menuItem}>
                  Admin Limits
                </MenuItem>
                <MenuItem icon={<UserGroupIcon width={14} />} onClick={onAdminManager} {...menuItem}>
                  Admin Manager
                </MenuItem>
                <MenuItem icon={<ChartBarIcon width={14} />} onClick={onHappCrypto} {...menuItem}>
                  Happ Crypto
                </MenuItem>
                <MenuDivider borderColor="var(--px-border)" />
              </>
            )}
            <MenuItem icon={<BanknotesIcon width={14} />} onClick={() => window.open(DONATION_URL, "_blank")} {...menuItem}>
              Donation
            </MenuItem>
            <MenuItem
              icon={<ArrowLeftOnRectangleIcon width={14} />}
              onClick={handleLogout}
              bg="transparent" _hover={{ bg: "rgba(239,68,68,0.12)" }}
              borderRadius="8px" color="red.400" fontSize="sm" fontWeight="medium"
            >
              Log out
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </HStack>
  );
};
