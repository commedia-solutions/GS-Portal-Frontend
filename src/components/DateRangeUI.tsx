import React from "react";
import {
    Box,
    Button,
    ClickAwayListener,
    IconButton,
    Paper,
    Popper,
    Typography,
} from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isWithinInterval, differenceInDays } from "date-fns";
import { vars } from "../ui/toast/themeBridge";

interface DateRangeUIProps {
    startDate: Date | null;
    endDate: Date | null;
    onChange: (start: Date | null, end: Date | null) => void;
    label?: string;
}

const DateRangeUI: React.FC<DateRangeUIProps> = ({ startDate, endDate, onChange, label }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const [currentMonth, setCurrentMonth] = React.useState(new Date());

    const [tempStart, setTempStart] = React.useState<Date | null>(startDate);
    const [tempEnd, setTempEnd] = React.useState<Date | null>(endDate);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(anchorEl ? null : event.currentTarget);
        setTempStart(startDate);
        setTempEnd(endDate);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleDone = () => {
        onChange(tempStart, tempEnd);
        handleClose();
    };

    const handleDateClick = (day: Date) => {
        if (!tempStart || (tempStart && tempEnd)) {
            setTempStart(day);
            setTempEnd(null);
        } else {
            if (day < tempStart) {
                setTempEnd(tempStart);
                setTempStart(day);
            } else {
                setTempEnd(day);
            }
        }
    };

    const isInRange = (day: Date) => {
        if (tempStart && tempEnd) {
            return isWithinInterval(day, { start: tempStart, end: tempEnd });
        }
        return false;
    };

    const renderCalendar = (month: Date) => {
        const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
        const days = [];
        let day = start;

        while (day <= end) {
            days.push(day);
            day = addDays(day, 1);
        }

        return (
            <Box sx={{ width: 280, p: 1 }}>
                <Typography sx={{ textAlign: "center", fontWeight: 700, mb: 2, fontSize: 13, color: vars.text }}>
                    {format(month, "MMMM yyyy")}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", mb: 1 }}>
                    {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
                        <Typography key={d} sx={{ fontSize: 11, textAlign: "center", color: vars.textDim, fontWeight: 600 }}>{d}</Typography>
                    ))}
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 40px)", gridAutoRows: "40px" }}>
                    {days.map((d, i) => {
                        const isSelected = (tempStart && isSameDay(d, tempStart)) || (tempEnd && isSameDay(d, tempEnd));
                        const range = isInRange(d);
                        const isCurrentMonth = isSameMonth(d, month);

                        return (
                            <Box
                                key={i}
                                onClick={() => handleDateClick(d)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    color: !isCurrentMonth ? vars.textWeak : isSelected ? "#fff" : vars.text,
                                    bgcolor: isSelected ? "#4F46E5" : range ? "rgba(79, 70, 229, 0.15)" : "transparent",
                                    borderRadius: isSelected ? (tempStart && isSameDay(d, tempStart) && tempEnd ? "50% 0 0 50%" : tempEnd && isSameDay(d, tempEnd) ? "0 50% 50% 0" : "50%") : "0",
                                    "&:hover": { bgcolor: isSelected ? "#4F46E5" : vars.bgHover },
                                    position: "relative",
                                    fontWeight: isSelected ? 800 : 500
                                }}
                            >
                                {format(d, "d")}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        );
    };

    const daysCount = tempStart && tempEnd ? differenceInDays(tempEnd, tempStart) + 1 : 0;

    return (
        <Box sx={{ position: "relative" }}>
            {label && <Typography sx={{ fontSize: 11, color: vars.textDim, mb: 0.5, fontWeight: 600 }}>{label}</Typography>}
            <Box
                onClick={handleClick}
                sx={{
                    height: 32,
                    border: "1px solid rgba(79, 70, 229, 0.5)",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    px: 1.5,
                    gap: 1,
                    cursor: "pointer",
                    bgcolor: vars.bgCtrl,
                    minWidth: 220,
                    "&:hover": { borderColor: "#4F46E5" }
                }}
            >
                <Typography sx={{ fontSize: 12, color: startDate ? vars.text : vars.textWeak, flexGrow: 1, fontWeight: 600 }}>
                    {startDate ? `${format(startDate, "d MMM yyyy")} — ${endDate ? format(endDate, "d MMM yyyy") : "..."}` : "Select Date Range"}
                </Typography>
                <CalendarTodayIcon sx={{ fontSize: 16, color: "#4F46E5" }} />
            </Box>

            <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} placement="bottom-start" sx={{ zIndex: 1500, pt: 1 }}>
                <ClickAwayListener onClickAway={handleClose}>
                    <Paper sx={{ 
                        bgcolor: vars.bgCard, 
                        color: vars.text,
                        border: `1px solid ${vars.border}`, 
                        borderRadius: "12px", 
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                        overflow: "hidden"
                    }}>
                        <Box sx={{ display: "flex", p: 1, position: "relative" }}>
                            <Box sx={{ position: "absolute", width: "100%", display: "flex", justifyContent: "space-between", px: 2, top: 12 }}>
                                <IconButton size="small" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} sx={{ color: vars.textDim }}>
                                    <ChevronLeftIcon />
                                </IconButton>
                                <IconButton size="small" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} sx={{ color: vars.textDim }}>
                                    <ChevronRightIcon />
                                </IconButton>
                            </Box>
                            {renderCalendar(currentMonth)}
                            <Box sx={{ width: 1, bgcolor: vars.borderWeak, my: 1 }} />
                            {renderCalendar(addMonths(currentMonth, 1))}
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2, borderTop: `1px solid ${vars.borderWeak}` }}>
                            <Typography sx={{ fontSize: 12, color: vars.textDim, fontWeight: 600 }}>
                                {daysCount > 0 ? `${daysCount} days` : ""}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Button size="small" onClick={handleClose} sx={{ color: vars.textDim, textTransform: "none", fontWeight: 700 }}>Cancel</Button>
                                <Button size="small" variant="contained" onClick={handleDone} sx={{ bgcolor: "#4F46E5", textTransform: "none", fontWeight: 700, borderRadius: "6px" }}>Done</Button>
                            </Box>
                        </Box>
                    </Paper>
                </ClickAwayListener>
            </Popper>
        </Box>
    );
};

export default DateRangeUI;
