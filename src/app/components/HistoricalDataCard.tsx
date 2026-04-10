import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
  Icon,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export interface HistoricalField {
  label: string;
  value: string | string[];
  icon?: string;
  type?: 'badge-success' | 'badge-warning' | 'badge-info' | 'text' | 'disabled';
}

export interface HistoricalSection {
  title: string;
  fields: HistoricalField[];
}

export interface HistoricalAttachment {
  name: string;
  size: string;
}

export interface HistoricalDataCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status: string;
  readOnly?: boolean;
  sections: HistoricalSection[];
  attachments?: HistoricalAttachment[];
}

export function HistoricalDataCard({
  id,
  title,
  subtitle,
  status,
  readOnly,
  sections,
  attachments,
}: HistoricalDataCardProps) {
  const [expanded, setExpanded] = React.useState(true);

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => setExpanded(isExpanded)}
      disableGutters
      sx={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E0E0E0',
        borderRadius: '8px !important',
        '&:before': { display: 'none' }, // Remove divider
        boxShadow: 'none',
        overflow: 'hidden',
        mb: 3,
        pointerEvents: readOnly ? 'auto' : 'auto', 
      }}
    >
      <AccordionSummary
        sx={{
          padding: '16px 24px',
          borderBottom: expanded ? '1px solid #E0E0E0' : 'none',
          minHeight: 'auto',
          '& .MuiAccordionSummary-content': { margin: 0, alignItems: 'flex-start', justifyContent: 'space-between' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h6" fontWeight="bold">
              {id} — {title}
            </Typography>
            <Chip label={status} size="small" sx={{ fontWeight: 'bold', backgroundColor: '#EFF6FF', color: '#1D4ED8', borderRadius: '4px' }} />
          </Box>
          {subtitle && (
            <Typography variant="body2" color="grey.500" fontWeight={500}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Button 
          variant="outlined" 
          size="small" 
          sx={{ ml: 2, mt: 0.5, borderRadius: '6px', textTransform: 'none', borderColor: '#E2E8F0', color: '#0F172A', fontWeight: 600, height: 32 }}
          endIcon={<ExpandMoreIcon sx={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
        >
          {expanded ? 'Ocultar' : 'Mostrar'}
        </Button>
      </AccordionSummary>

      <AccordionDetails sx={{ padding: '24px' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, 1fr)' }, gap: 2, pointerEvents: readOnly ? 'none' : 'auto' }}>
          {sections.map((section, idx) => (
            <Box key={idx} sx={{ border: '1px solid #E2E8F0', borderRadius: '8px', p: 2, backgroundColor: '#FAFAF9' }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ mb: 3, display: 'block', letterSpacing: '0.8px', textTransform: 'uppercase' }}
              >
                {section.title}
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {section.fields.map((field, fIdx) => (
                  <Box key={fIdx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    {field.icon && (
                      <Icon sx={{ color: 'grey.500', fontSize: 20, mt: '2px' }}>
                        {field.icon}
                      </Icon>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'grey.600',
                          fontSize: '11px',
                          fontWeight: 600,
                          textTransform: 'uppercase',
                          display: 'block',
                          mb: 0.5,
                          letterSpacing: '0.5px'
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {Array.isArray(field.value) ? (
                            field.value.length > 0 ? (
                              field.value.map((v, i) => (
                                <Chip key={i} label={v} size="small" variant="outlined" sx={{ height: 22, fontSize: '12px', borderColor: '#E2E8F0', backgroundColor: '#FFFFFF', mb: 0.5, fontWeight: 500 }} />
                              ))
                            ) : (
                              <Typography variant="body2" sx={{ fontSize: '14px', fontStyle: 'italic', color: 'grey.500' }}>Não informado</Typography>
                            )
                        ) : field.type === 'badge-success' ? (
                          <Chip 
                            label={field.value || 'Sim'} 
                            size="small" 
                            sx={{ height: 22, fontSize: '12px', backgroundColor: '#ECFCCB', color: '#4D7C0F', fontWeight: 600, borderRadius: '4px' }} 
                          />
                        ) : field.type === 'badge-warning' ? (
                          <Chip 
                            label={field.value} 
                            size="small" 
                            variant="outlined"
                            sx={{ height: 22, fontSize: '12px', borderColor: '#FDE047', color: '#CA8A04', backgroundColor: '#FEFCE8', fontWeight: 600, borderRadius: '4px' }} 
                          />
                        ) : field.type === 'badge-info' ? (
                           <Chip 
                            label={field.value} 
                            size="small" 
                            sx={{ height: 22, fontSize: '12px', backgroundColor: '#DBEAFE', color: '#1D4ED8', fontWeight: 600, borderRadius: '4px' }} 
                          />
                        ) : field.type === 'disabled' ? (
                           <Typography variant="body2" sx={{ fontSize: '14px', fontStyle: 'italic', color: 'grey.500' }}>
                            {field.value}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{ fontSize: '13px', fontWeight: 600, color: '#1E293B', cursor: readOnly ? 'default' : 'text' }}
                          >
                            {field.value}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>

        {attachments && attachments.length > 0 && (
          <Box sx={{ mt: 3, border: '1px solid #E2E8F0', borderRadius: '8px', p: 3, backgroundColor: '#FAFAF9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <AttachFileIcon sx={{ color: 'grey.600', fontSize: 20 }} />
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ letterSpacing: '0.8px', textTransform: 'uppercase' }}
              >
                DOCUMENTOS ANEXADOS
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {attachments.map((file, idx) => (
                <Box
                  key={idx}
                  component="a"
                  href={`/assets/${file.name}`}
                  download
                  target="_blank"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    border: '1px solid #E2E8F0',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    backgroundColor: '#FFFFFF',
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: '#F8FAFC',
                      borderColor: '#CBD5E1',
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ color: 'primary.main', display: 'flex' }}>
                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    </Box>
                    <Box sx={{ overflow: 'hidden' }}>
                      <Typography variant="body2" fontWeight={600} color="#334155">
                        {file.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {file.size}
                      </Typography>
                    </Box>
                  </Box>
                  <DownloadIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
}
