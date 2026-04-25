// import { useState } from 'react'
// import './App.css'
// import { Box, Button, CircularProgress, Container, FormControl, Input, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
// import axios from 'axios';

// function App() {
//   const [emailContent, setEmailContent] = useState('');
//   const [tone, setTone] = useState('');
//   const [generatedReply, setGeneratedReply] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async () => {
//   setLoading(true);
//   setError('');

//   try {
//     const response = await axios.post(
//       `${import.meta.env.VITE_API_URL}/api/email/generate`,
//       {
//         emailContent,
//         tone
//       },
//       {
//         timeout: 10000
//       }
//     );

//     setGeneratedReply(
//       typeof response.data === 'string'
//         ? response.data
//         : JSON.stringify(response.data)
//     );

//   } catch (error) {
//     setError(
//       error.response?.data ||
//       error.message ||
//       'Failed to generate email reply'
//     );
//     console.error(error);
//   } finally {
//     setLoading(false);
//   }
// };

//   return (
//     <Container maxWidth="md" sx={{py:4}}>
//       <Typography variant='h3' component="h1" gutterBottom>
//         Email Reply Generator
//       </Typography>

//       <Box sx={{ mx: 3 }}>
//         <TextField 
//           fullWidth
//           multiline
//           rows={6}
//           variant='outlined'
//           label="Original Email Content"
//           value={emailContent || ''}
//           onChange={(e) => setEmailContent(e.target.value)}
//           sx={{ mb:2 }}/>

//           <FormControl fullWidth sx={{ mb:2 }}>
//             <InputLabel>Tone (Optional)</InputLabel>
//             <Select
//               value={tone || ''}
//               label={"Tone (Optional)"}
//               onChange={(e) => setTone(e.target.value)}>
//                 <MenuItem value="">None</MenuItem>
//                 <MenuItem value="professional">Professional</MenuItem>
//                 <MenuItem value="casual">Casual</MenuItem>
//                 <MenuItem value="friendly">Friendly</MenuItem>
//             </Select>
//           </FormControl>

//           <Button
//             variant='contained'
//             onClick={handleSubmit}
//             disabled={!emailContent || loading}
//             fullWidth>
//             {loading ? <CircularProgress size={24}/> : "Generate Reply"}
//           </Button>
//       </Box>

//       {error && (
//         <Typography color='error' sx={{ mb:2 }}>
//           {error}
//         </Typography>
//       )}

//       {generatedReply && (
//        <Box sx={{ mt: 3}}>
//           <Typography variant='h6' gutterBottom>
//             Generated Reply:
//           </Typography>
//           <TextField
//             fullWidth
//             multiline
//             rows={6}
//             variant='outlined'
//             value={generatedReply || ''}
//             inputProps={{ readOnly: true }}/>
        
//         <Button
//           variant='outlined'
//           sx={{ mt: 2 }}
//           onClick={() => navigator.clipboard.writeText(generatedReply)}>
//             Copy to Clipboard
//         </Button>
//        </Box> 
//       )}
//     </Container>
//   )
// }

// export default App




import { useState } from 'react'
import './App.css'
import {
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';

function App() {
  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Fallback API (IMPORTANT FIX)
  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://smart-email-assistant-project.onrender.com";

  const handleSubmit = async () => {
    console.log("Button clicked");
    console.log("API URL:", API_URL);

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_URL}/api/email/generate`,
        {
          emailContent,
          tone
        },
        {
          timeout: 10000
        }
      );

      console.log("Response:", response.data);

      setGeneratedReply(
        typeof response.data === 'string'
          ? response.data
          : JSON.stringify(response.data)
      );

    } catch (err) {
      console.error("ERROR:", err);

      setError(
        err.response?.data ||
        err.message ||
        'Failed to generate email reply'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant='h3' component="h1" gutterBottom>
        Email Reply Generator
      </Typography>

      <Box sx={{ mx: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={6}
          variant='outlined'
          label="Original Email Content"
          value={emailContent}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Tone (Optional)</InputLabel>
          <Select
            value={tone}
            label="Tone (Optional)"
            onChange={(e) => setTone(e.target.value)}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="professional">Professional</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button
          variant='contained'
          onClick={handleSubmit}
          disabled={loading}   // ✅ FIXED (removed emailContent check for testing)
          fullWidth
        >
          {loading ? <CircularProgress size={24} /> : "Generate Reply"}
        </Button>
      </Box>

      {error && (
        <Typography color='error' sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {generatedReply && (
        <Box sx={{ mt: 3 }}>
          <Typography variant='h6' gutterBottom>
            Generated Reply:
          </Typography>

          <TextField
            fullWidth
            multiline
            rows={6}
            variant='outlined'
            value={generatedReply}
            inputProps={{ readOnly: true }}
          />

          <Button
            variant='outlined'
            sx={{ mt: 2 }}
            onClick={() => navigator.clipboard.writeText(generatedReply)}
          >
            Copy to Clipboard
          </Button>
        </Box>
      )}
    </Container>
  );
}

export default App;