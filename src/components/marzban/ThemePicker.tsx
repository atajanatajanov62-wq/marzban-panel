import {
  Box,
  HStack,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  SimpleGrid,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { SwatchesIcon } from "./ThemePickerIcon";
import { useTheme } from "contexts/ThemeContext";
import { PanelTheme } from "themes/themes";
import { FC } from "react";

const ThemeSwatch: FC<{ theme: PanelTheme; isActive: boolean; onClick: () => void }> = ({
  theme,
  isActive,
  onClick,
}) => {
  return (
    <Tooltip label={theme.label} placement="top" hasArrow>
      <VStack
        spacing={2}
        cursor="pointer"
        onClick={onClick}
        role="button"
        aria-label={`Select ${theme.label} theme`}
        _hover={{ transform: "scale(1.05)" }}
        transition="transform 0.15s ease"
        userSelect="none"
      >
        <Box
          w="72px"
          h="52px"
          borderRadius="12px"
          overflow="hidden"
          position="relative"
          border={isActive ? `2px solid ${theme.accent}` : "2px solid rgba(255,255,255,0.1)"}
          boxShadow={
            isActive
              ? `0 0 20px ${theme.accent}66, 0 0 40px ${theme.accent}22, 0 2px 8px rgba(0,0,0,0.4)`
              : "0 2px 8px rgba(0,0,0,0.3)"
          }
          transition="all 0.2s ease"
        >
          {/* gradient bg */}
          <Box
            position="absolute"
            inset={0}
            style={{ background: theme.previewGradient }}
          />
          {/* pattern overlay */}
          <Box
            position="absolute"
            inset={0}
            style={{
              backgroundImage: theme.pattern,
              backgroundSize: theme.patternSize,
              opacity: 0.6,
            }}
          />
          {/* fake dashboard bottom bar */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            h="36%"
            bg="rgba(0,0,0,0.35)"
            backdropFilter="blur(2px)"
          />
          <Box
            position="absolute"
            bottom="6px"
            left="7px"
            w="55%"
            h="5px"
            bg={theme.accent}
            opacity={0.85}
            borderRadius="full"
          />
          {/* emoji badge */}
          <Box
            position="absolute"
            top="5px"
            left="6px"
            fontSize="14px"
            lineHeight="1"
          >
            {theme.emoji}
          </Box>
          {isActive && (
            <Box
              position="absolute"
              top="5px"
              right="6px"
              w="8px"
              h="8px"
              borderRadius="full"
              bg={theme.accent}
              boxShadow={`0 0 8px ${theme.accent}`}
            />
          )}
        </Box>
        <Text
          fontSize="9px"
          color={isActive ? theme.accent : "var(--px-text-muted)"}
          fontWeight={isActive ? "black" : "normal"}
          lineHeight={1}
          textAlign="center"
          letterSpacing="0.08em"
          textTransform="uppercase"
          transition="color 0.18s"
          noOfLines={1}
        >
          {theme.label}
        </Text>
      </VStack>
    </Tooltip>
  );
};

const glassBtn = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  w: "36px",
  h: "36px",
  bg: "var(--px-glass-bg, rgba(255,255,255,0.07))",
  border: "1px solid var(--px-border, rgba(255,255,255,0.12))",
  color: "var(--px-text, white)",
  borderRadius: "10px",
  cursor: "pointer",
  transition: "background 0.15s",
  _hover: { bg: "var(--px-hover-bg)" },
  flexShrink: 0,
};

export const ThemePicker: FC = () => {
  const { currentTheme, setTheme, themes } = useTheme();

  return (
    <Popover placement="bottom-end" isLazy>
      <PopoverTrigger>
        <Box
          as="button"
          {...glassBtn}
          aria-label="Change theme"
          title="Theme"
        >
          <SwatchesIcon />
        </Box>
      </PopoverTrigger>
      <PopoverContent
        bg="var(--px-popover-bg)"
        border="1px solid var(--px-border)"
        borderRadius="18px"
        boxShadow="0 20px 60px rgba(0,0,0,0.6), 0 4px 20px rgba(0,0,0,0.3)"
        backdropFilter="blur(24px)"
        w="290px"
        _focus={{ outline: "none" }}
      >
        <PopoverArrow bg="var(--px-popover-bg)" borderColor="var(--px-border)" />
        <PopoverBody p={4}>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between" align="center">
              <Text
                fontSize="11px"
                color="var(--px-text-muted)"
                fontWeight="semibold"
                textTransform="uppercase"
                letterSpacing="0.12em"
              >
                Panel Universe
              </Text>
              <Box
                w="8px"
                h="8px"
                borderRadius="full"
                bg={currentTheme.accent}
                boxShadow={`0 0 10px ${currentTheme.accent}`}
              />
            </HStack>

            <SimpleGrid columns={3} gap={3} justifyItems="center">
              {themes.map((theme) => (
                <ThemeSwatch
                  key={theme.name}
                  theme={theme}
                  isActive={currentTheme.name === theme.name}
                  onClick={() => setTheme(theme.name)}
                />
              ))}
            </SimpleGrid>

            <Box
              pt={2}
              borderTop="1px solid var(--px-border)"
            >
              <HStack justify="space-between" align="center">
                <Text fontSize="10px" color="var(--px-text-faint)" letterSpacing="0.04em">
                  Active
                </Text>
                <Text
                  fontSize="10px"
                  fontWeight="black"
                  letterSpacing="0.1em"
                  textTransform="uppercase"
                  color={currentTheme.accent}
                  textShadow={`0 0 8px ${currentTheme.accent}88`}
                >
                  {currentTheme.emoji} {currentTheme.brandName}
                </Text>
              </HStack>
            </Box>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};
