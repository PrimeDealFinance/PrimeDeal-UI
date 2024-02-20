'use client'
import Button from "@mui/joy/Button";
import "@/app/font.css"

interface Props {
  text?: string;
  handleConnectClick?: () => void;
}

const MainButton = ({ text, handleConnectClick }: Props): React.ReactNode => {
  return (
    <div className="absolute z-[2] right-[70px]">
      <Button variant="outlined"
        sx={{
          borderRadius: '1000px',
          boxShadow: 'none',
          textTransform: 'none',
          fontSize: '12px',
          fontStyle: 'normal',
          fontWeight: '400',
          color: '#FFFFFF',
          letterSpacing: '-0.54px',
          width: '160px',
          border: '1px solid',
          lineHeight: 1.5,
          backgroundColor: '#010306',
          borderColor: '#5606FF',
          fontFamily: [
            'GothamPro',
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
          ].join(','),
          '&:hover': {
            backgroundColor: '#5606FF',
            borderColor: '#010306',
            boxShadow: 'none',
          },
        }}
        onClick={handleConnectClick}
        className="max-[767px]:h-[40px] h-[48px]"
      >
        {text}
      </Button>
    </div>
  );
};

export default MainButton;