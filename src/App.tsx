import React, { useState, useEffect } from 'react';
import Data, { ContentData } from './components/_data/Data';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { DebugHeader } from './components/_debug/DebugHeader/DebugHeader';
import { Footbar } from './components/Footbar/Footbar';
import { ContentEditor, ContentEditorProps } from './components/ContentEditor/ContentEditor';
import { EnvironmentContext } from './contexts/EnvironmentContext/EnvironmentContext';
import { useWindowWidth } from './hooks/useWindowWidth';
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen';
import { CustomAppBar } from './components/CustomAppBar/CustomAppBar';
import { DebugFonts } from './components/_debug/DebugFonts';
import { ContentView } from './components/ContentView/ContentView';
import { NavigationBottom } from './components/NavigationBottom/NavigationBottom';
import "./App.css";
import { FONT_FAMILY } from './components/_data/Constants';
import { HardCodedMainPage } from './components/HardcodedMainPage/HardCodedMainPage';
import { Team } from './components/HardCodedTeamPage/LegacyHardCodedTeamPage';
import { Sponsors } from './components/HardCodedSponsorsPage/LegacyHardCodedSponsorsPage';
import 'bootstrap/dist/css/bootstrap.min.css';


// This line is to remove a bug that Firefox has
// TODO: insert link explaining why
window.addEventListener("unload", function () { });

type AppProps = {
	IEOREDGE: boolean,
	currYear: number,
	firebase?: any
}
const debugURL = "/Editor";

/**
 * App is the main application that handles all the route logic and rendering.
 *
 * Last Modified
 * William Kwok
 * July 17, 2019
 */
const App: React.FC<AppProps> = ({ IEOREDGE, currYear, firebase }) => {
	const [loading, setLoading] = useState<boolean>(true);
	const [contentData, setContentData] = useState<ContentData>(Data.getContentData());
	// TODO: Change arg back to just debug URL
	// const [pageTitle, setPageTitle] = useState<string>(debugURL); //(debugURL)
	const [pageTitle, setPageTitle] = useState<string>(""); //(debugURL)
	// !!!Change this back to debugURL once done coding main page
	const [debugMode, setDebugMode] = useState<boolean>(true);
	const windowWidth = useWindowWidth();

	let name = `https://${currYear}.igem.org/Team:Washington`;
	let imgsToPrefetch: string[] = Data.getImgsToPrefetch();
	let imgsLoaded = 0;

	const displayConstants = Data.getDisplayConstants();
	const theme = createMuiTheme({
		palette: {
			primary: {
				main: displayConstants.primaryColor as string
			},
			secondary: {
				main: displayConstants.secondaryColor as string
			}
		},
		typography: {
			fontFamily: FONT_FAMILY
		}
	});

    /**
     * Upon component mount, this effect determines if it is currently on the live website or not.
     * It sets the `pageTitle` to be `debugURL` if not live, or the text after `"Team:Washington"`
     * in the URL.
     *
     * eg "2019.igem.org/Team:Washington/Design" -> "/Design"
     */
	useEffect(() => {
        /**
         * Prefetch images will grab images to load in the background after the page has loaded
         */
		const prefetchImagesWaveTwo = () => {

		}

        /**
         * Prefetch images will grab images to load in the background after the page has loaded
         */
		const prefetchImages = () => {
			imgsToPrefetch.forEach((imgURL: string) => {
				const img = new Image();
				img.src = imgURL;
				img.onload = () => {
					imgsLoaded++;
					if (imgsLoaded === imgsToPrefetch.length) {
						prefetchImagesWaveTwo();
					}
				}
			})
		}
		prefetchImages();
		let splitTitle = window.location.href.split("igem");
		if (splitTitle.length === 2) {
			setPageTitle(splitTitle[1].split("Team:Washington")[1]);
			setDebugMode(false);
		} else {
			DebugFonts(); // Set fonts in body
		}
		setLoading(false);
		let dataRef: firebase.database.Reference | null = null;
		if (firebase) {
			dataRef = firebase.database().ref(`/${currYear}/ContentData`);
			if (dataRef) {
				dataRef.on("value", (snap) => {
					setContentData(snap.val() as ContentData);
				});
			}

			return () => {
				if (dataRef) {
					dataRef.off();
				}
			}
		} else {
			setContentData(Data.getContentData())
		}
	}, [pageTitle, imgsLoaded, imgsToPrefetch, currYear, firebase]);

    /**
     * Sets the loading state to true. This is used for in between pages. This function MUST be sent
     * down as a prop to ALL the pages, so the appropriate loading procedure takes place.
     *
     * @example `From now on, we will pass it down like this`
     *   <CustomView a={this.displayLoadingMessage} />
     *   // in CustomView:
     *   render() {
     *       let a = this.props.a;
     *       return (
     *           <div>
     *               <ChildView a={a} />
     *               <a href="_____" onClick={a} />
     *           </div>
     *       )
     *   }
     */
	const a = () => {
		setLoading(true);
		setTimeout(() => {
			setLoading(false);
		}, 3000);
	}


	return <div className="App">
		<EnvironmentContext.Provider value={{ windowWidth, firebase }}>
			<MuiThemeProvider theme={theme}>
				{debugMode && <>
					<DebugHeader />
				</>}

				<CustomAppBar name={name} pageTitle={pageTitle} a={a} />

				{!loading && <>
					<div className={`${debugMode ? "app-content-dev" : "app-content-real"}
                        ${windowWidth < 600 ? "mobile" : ""}`}>
						{/** Comment out this in final build */}
						{pageTitle === "/Editor" &&
							<ContentEditor
								contentData={contentData}
								currYear={currYear}
							/>}
						{/******HARDCODED DESCRIPTION PAGE**********/}
						{/* {pageTitle !== "/Editor"
							&& (pageTitle === "/Description") &&
							<div className="main-temporary">
								{pageTitle !== '/Description' &&
									<div>
										<h1 style={{ margin: "auto", textAlign: "center" }}>Immunosense: Detecting small molecules using a chemically-induced dimerization system</h1>

										<h2 style={{ margin: "auto", textAlign: "center" }}>Abstract:</h2>
										<p>
											Although biosensors are commonly used to detect many different molecules of interest, they cannot effectively detect small hydrophobic molecules in biological systems. We propose combining chemically induced dimerization (CID), in which two proteins dimerize only in the presence of a ligand, with a traditional luciferase assay to create a biosensor that luminesces when the desired molecule is introduced. Using molecule-specific nanobodies, we can design the two CID binders to attach to a wide variety of small molecules, even those that are challenging for conventional biosensors to detect. Through its specificity and ability to bind to small or hydrophobic molecules, the CID system overcomes problems that other biosensors face. As a proof-of-concept, we implemented an in vivo CID biosensor to detect the presence of cannabidiol. With the nanobody CID system, we hope to introduce a novel biosensor that can detect a variety of important small molecules across research, biotechnology, and medicine.
										</p>
									</div>
								}

								<h1 style={{ margin: "auto", textAlign: "center" }}>Project Inspiration and Description</h1>
								<p>
									Our project focuses on developing technologies that help researchers to detect small molecules, which traditionally have been much more difficult to detect using biological assays than larger molecules. Our technologies revolve around chemically induced dimerization (CID), in which two proteins dimerize in the presence of a small molecule. This method has been previously used to control cell signaling, regulatory and metabolic pathways, and logic gates for biological computation in living mammalian cells. However, few naturally-occuring CID systems and their derivatives are currently available for research and therapeutic purposes. Creating a CID system with desired affinity and specificity for any given small molecule remains an unsolved problem for computational design and other protein engineering approaches. Solving it would open a wide range of possibilities in the development of diagnostic biosensors, high-precision therapeutics, and beyond.
                                </p>
								<p>
									We are using a novel strategy to select CID binders from a vast and diverse combinatorial antibody library, and applying them towards the development of a biosensor. We will specifically be developing a biosensor using these antibodies to detect cannabidiol (CBD), a compound derived from the hemp plant which has been used to treat epilepsy, anxiety, and chronic pain, although more research is needed to verify its effectiveness. We are working to engineer this biosensor both as a proof of concept and as a way to help further research into CBD.
                                </p>
								<p>
									We hope that the result of our project will benefit the scientific community by creating a generalizable bioengineered tool that can detect the presence of small molecules with a high degree of accuracy and efficiency, at a lower cost than other tools that have been traditionally used.
                                </p>
								<p>
									This project was inspired by work in the Gu Lab at the University of Washington and their work dealing with the creation of a CID system. We wanted to take what we learned from last year, build upon it, and package everything in a consumer friendly device to detect CBD. Furthermore, since our team has had experience with CID devices from our 2018 project that dealt with detecting anchor binders for cholecalciferol and artemisinin.
                                </p>
							</div>} */}

						{/*********HARDCODED MAIN PAGE*********** */}
						{pageTitle !== "/Editor"
							&& pageTitle === "" &&
							<HardCodedMainPage a={a} />}
						{/*********HARCODED TEAM PAGE *********** */}
						{pageTitle !== "/Editor"
							&& pageTitle === "/Team"
							&& <Team data={Data.getTeamData()} />

						}
						{/** HARDCODED SPONSORS PAGE */}
						{pageTitle !== "/Editor"
							&& pageTitle === "/Sponsors"
							&& <Sponsors data={Data.getSponsorsData()} />

						}
						{/*********REGULAR CONTENT VIEW*************/}
						{pageTitle !== "/Editor" && pageTitle !== "" && pageTitle !== "/MAIN_PAGE" &&
							<ContentView contentData={contentData} pageTitle={pageTitle} />
						}
					</div>
					<NavigationBottom name={name} pageTitle={pageTitle} a={a} />
					<Footbar a={a} />
				</>}

				{loading &&
					<LoadingScreen />}
			</MuiThemeProvider>
		</EnvironmentContext.Provider>
	</div>
}


export default App;
