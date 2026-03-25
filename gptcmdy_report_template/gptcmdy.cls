\NeedsTeXFormat{LaTeX2e}

\ProvidesClass{gptcmdy}

\newif\if@Seminar
\newif\if@Project
\newif\if@MinorProject
\newif\if@Synopsis

\DeclareOption{seminar}{\@Seminartrue}
\DeclareOption{project}{\@Projecttrue}
\DeclareOption{minor}{\@MinorProjecttrue}
\DeclareOption{synopsis}{\@Synopsistrue}
\ProcessOptions\relax

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%  Load the correct class.
\if@Synopsis
    \LoadClass[12pt,a4paper]{article}
\else
    \LoadClass[12pt,a4paper]{report}
\fi

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% Geometry and page layout
\RequirePackage[%compat2,
a4paper,left=1.5in,right=1in,top=1.2in,bottom=1.2in, headheight=1in, headsep=1.5cm]{geometry}[2002/07/08]
\RequirePackage[utf8]{inputenc}
\RequirePackage[T1]{fontenc}
\RequirePackage[hidelinks]{hyperref}


\renewcommand{\@pnumwidth}{2.5em}
\emergencystretch=\maxdimen
\newfont{\dipfntbf}{eufb10 scaled\magstep2} 

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% Using setspace to do the single/double spacing.  Setspace also
%% makes all tables and figures have single spacing automatically.

\RequirePackage{setspace}
\RequirePackage[dvips]{graphicx}
\RequirePackage{color}
\RequirePackage{enumitem}
\RequirePackage{truncate}

%% tweaking table of contents %%
\RequirePackage[nottoc]{tocbibind}
\hyphenpenalty=10000
\exhyphenpenalty=10000
\sloppy

\setstretch{1.5}

\setlist[itemize]{
    partopsep=0pt, % Removes space before the list if it follows a paragraph
    parsep=0pt,  % Removes space between paragraphs within a single item
}

\setlist[enumerate]{
    partopsep=0pt, % Removes space before the list if it follows a paragraph
    parsep=0pt,  % Removes space between paragraphs within a single item
}


%% Table of contents
\let\oldtableofcontents\tableofcontents
\renewcommand{\tableofcontents}{%
  \parskip 0em
  \pagestyle{plain}
  \oldtableofcontents
  \clearpage
  \pagenumbering{arabic}%
  \pagestyle{headings}%
  \parskip 1em
}

\renewenvironment{abstract}{%
  \chapter*{\centering\MakeUppercase{\abstractname}}
  \pagestyle{plain}
  \addcontentsline{toc}{chapter}{\MakeUppercase{\abstractname}}
}{\par}



%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% The figure captioning is done correctly via the hang option.
%\RequirePackage[hang]{caption2}


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%% Other useful macros.  Many of these are modifications from newdiss.cls

% \department{department name} -- user macro to declare name of department.
\def\department#1{\gdef\@department{#1}}
\def\programme#1{\gdef\@programme{#1}}
\def\regno#1{\gdef\@regno{#1}}
\def\acyear#1{\gdef\@acyear{#1}}

%%%%%%%%%\def\section{\@startsection {section}{1}{\z@}{-\baselineskip}
%%%%%%%%%{\baselineskip}{\large\bf}}
%%%%%%%%%make section titles bold and 12 point, 2 blank lines before, 1 after 
\def\section{\@startsection {section}{2}{\z@}{2.5ex}{1ex}{\large\bf}}
%%%%%%%%%make subsection titles bold and 11 point, 1 blank line before, 1 after 
\def\subsection{\@startsection {subsection}{1}{\z@}{1ex}{1ex}{\normalsize\bf}}
\def\subsubsection{\@startsection {subsubsection}{1}{\z@}{1ex}{.5ex}{\normalsize\bf}}
\def\thesubsubsection{\roman{subsubsection}} %%%' to make the subsubsection numbering to roman 'maketoc

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% The title page
\def\maketitle{%
  \thispagestyle{empty}
  \newpage
  \null
  \setcounter{page}{0}
  \parskip=0pt
  \begin{center}%
  \let \footnote \thanks
  \vglue 0in % this makes top margin 2in
  \vskip -5ex%
  \if@Synopsis
    {\large \em SYNOPSIS OF \par}
  \fi
  \begin{singlespace}
  {\Large \bf \expandafter{\@title} \par}%
  \end{singlespace}
  \vskip 10ex%
  {\normalsize
      {\sc A \if@MinorProject Minor \fi \if@Project Project \else\if@Seminar Seminar \fi\fi Report}\par
      
	\vskip 0.5ex%

    \if@Synopsis
		{\normalsize\em to be submitted }
    \else
		{\normalsize\em submitted }
    \fi
	{\em in partial fulfilment of the requirements for the award of}\par
	
	\vskip 3ex%

	{\dipfntbf  Diploma}\\
	{\em in}\\
	{\large \bf \sc \textbf{\@programme}}\\
	{\em of}\\
	{\large \sc \textbf{State Board of Technical Education, Kerala}}\\	
	
	\vskip 1.5cm%

	{\em by}
	
	\vskip 2ex%

	{\bf \normalsize \MakeUppercase{\@author}\ (\@regno)}\\
	{\normalsize \displayteam{\\ }}
	\vskip 3ex%

    }
  \end{center}%

  \vspace*{1.5cm}
  
  \centerline{\includegraphics[width=3cm]{logo}}
  \vfill
\begin{singlespacing}
  \begin{center}
    {\bf \sc \small Department of \@department}\\
    {\bf \sc \small Government Polytechnic College, Mananthavady}\\
    
    \vglue 0.30em
    {\bf \small \@acyear}\par
  
  \end{center}
\end{singlespacing}
  \pagenumbering{roman}
  \setlength{\parskip}{1em}
}

%\def\titlepage{\newpage\thispagestyle{empty}\c@page\z@}
%\def\endtitlepage{\newpage}

\if@Synopsis
   \renewcommand\refname{REFERENCES}
\else
   \renewcommand{\bibname}{REFERENCES}
   % QUOTATIONS
   %
   \def\quotations{\chapter*{\centerline{QUOTATIONS}}
   %\addcontentsline{toc}{chapter}{QUOTATIONS}
   }

   % DEDICATION
   %
   \def\dedication{\chapter*{\centerline{DEDICATION}}
   %\addcontentsline{toc}{chapter}{DEDICATION}
   }

   % CERTIFICATE
   %
   \def\certificate{%% A preliminary chapter
    		\clearpage
     	\thispagestyle{empty}
     
		\begin{center}
		\begin{spacing}{1.1}
		\large \bfseries
		DEPARTMENT OF \MakeUppercase{\@department}
		GOVERNMENT POLYTECHNIC COLLEGE MANANTHAVADY
		\end{spacing}
		\end{center}
     
     
     	\centerline{\includegraphics[width=3cm]{logo}}

     	\vskip 1cm

     	\centerline{\Large \textbf{\sc Certificate}}

     	\vskip 0.5cm
     	
     	{\em \noindent \hfill\@date}
     	
     	\vskip 0.5cm
     	
     
     	{\em This is to certify that the \if@MinorProject minor \fi \if@Project project \else\if@Seminar seminar \fi\fi report entitled {\em \bf \@title} is a bonafide record of the work done by {\em \bf \normalsize \@author\ (\@regno)} along with {\em \displayteamcert{}} under our guidance towards partial fulfillment of the requirements for the award of \textbf{\em Diploma in \@programme} of the State Board of Technical Education, Government of Kerala during the year \@acyear.}

		\vspace*{2.5cm}

		{
		\small
		\noindent
		{\em (Guide)}
		\hfill
		{\em (Head of Department)}
		\hfill
		{\em (Co-ordinator)}
		}
	
		\vskip 3cm
	
		\centerline{\em \small (Seal)}
		\setcounter{page}{0}
	}


   % ACKNOWLEDGEMENTS
   %
   \def\acknowledgements{\chapter*{\centering ACKNOWLEDGEMENTS}
   \pagestyle{plain}
   \addcontentsline{toc}{chapter}{ACKNOWLEDGEMENTS}
   }


   % GLOSSARY
   %
   \def\glossary{\chapter*{\centerline{GLOSSARY}}
   \addcontentsline{toc}{chapter}{GLOSSARY}
   }

   % ABBREVIATIONS
   %
   \def\abbreviations{\chapter*{\centerline{ABBREVIATIONS}}
   %%\addcontentsline{toc}{chapter}{ABBREVIATIONS}
   }

    %Makes the chapter heading
    \def\@makechapterhead#1{%
    \vspace*{50\p@}%
    {\parindent \z@ \centering
     \normalfont
    \ifnum \c@secnumdepth >\m@ne
    \bfseries \@chapapp\space \thechapter
    \par\nobreak
    \fi
    \vskip -20\p@
    \interlinepenalty\@M
    \LARGE \bf #1\par\nobreak
    \vspace*{75\p@}%
    \thispagestyle{plain}
    }}

   % Makes the chapter heading for \chapter* commands
   \def\@makeschapterhead#1{%
     \vspace*{50\p@}%%
     {\parindent \z@ \raggedright
       \normalfont
       \interlinepenalty\@M
       \LARGE \bfseries #1\par\nobreak
       \vspace*{75\p@}%
     }}


   %LIST OF PAPERS
   \def\listofpapers{
           \normalbaselines
           \chapter*{\centerline{LIST OF PAPERS}}
           \markboth{}{LIST OF PAPERS}
           \addcontentsline{toc}{chapter}{LIST OF PAPERS}
   }

   
   % CV
   \def\CV{\chapter*{\centerline{CURRICULUM VITAE}}}

   %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
   % Renewed commands to set the titles of various pages correctly.
  
	\renewcommand\contentsname{\centering TABLE OF CONTENTS}
	\renewcommand\listfigurename{\centering LIST OF FIGURES}
	\renewcommand\listtablename{\centering LIST OF TABLES}
	\renewcommand\chaptername{CHAPTER}
	\renewcommand\bibname{REFERENCES} % Bibliography name change
	\renewcommand\appendixname{APPENDIX}
\fi


% Headers and footers

%--- Control how marks are set
\renewcommand\chaptermark[1]{%
  \markboth{\truncate{0.4\textwidth}{#1}}{}%
}
\renewcommand\sectionmark[1]{%
  \markright{\truncate{0.4\textwidth}{\hfill\thesection\ #1}}%
}

% --- For "headings" page style (chapter/section names in header)
\def\ps@headings{%
  \def\@oddfoot{\scriptsize\hfil\em\thepage}
  \def\@evenfoot{\scriptsize\hfil\em\thepage}
  \def\@oddhead{\scriptsize\em\leftmark\hfil\scriptsize\rightmark}%
  \def\@evenhead{\scriptsize\em\leftmark\hfil\scriptsize\rightmark}%
}

% --- For "plain" page style (used on chapter-opening pages)
\def\ps@plain{%
  \let\@oddhead\@empty
  \let\@evenhead\@empty
  \def\@oddfoot{\scriptsize\hfil\em\thepage}%
  \def\@evenfoot{\scriptsize\hfil\em\thepage}}

\let\oldthebibliography\thebibliography
\renewcommand{\thebibliography}[1]{%
  \clearpage
  \markboth{}{REFERENCES}%
  \oldthebibliography{#1}%
}

\ExplSyntaxOn

% 1. Create variables
\clist_new:N \g_myproject_team_clist
\clist_new:N \l_myproject_tmp_clist

% 2. Define the \team command
\NewDocumentCommand{\team}{m}
 {
  \clist_gset:Nn \g_myproject_team_clist { #1 }
 }

% 3. The display command for Title Page
\NewDocumentCommand{\displayteam}{m}
 {
  \clist_clear:N \l_myproject_tmp_clist
  % Map and Uppercase
  \clist_map_inline:Nn \g_myproject_team_clist
   {
    \clist_put_right:Nn \l_myproject_tmp_clist { \MakeUppercase{ ##1 } }
   }
  % Display with separator (e.g., \\)
  \clist_use:Nn \l_myproject_tmp_clist { #1 }
 }

% 4. The display command for Certificate
\NewDocumentCommand{\displayteamcert}{ }
 {
  \clist_clear:N \l_myproject_tmp_clist
  \clist_map_inline:Nn \g_myproject_team_clist
   {
    \clist_put_right:Nn \l_myproject_tmp_clist { \MakeUppercase{ ##1 } }
   }
  % Display with smart "and"
  \clist_use:Nnnn \l_myproject_tmp_clist { ~{\em and}~ } { {\em ,}~ } { ~{\em and}~ }
 }

\ExplSyntaxOff