import PaperContainer from "../components/PaperContainer";
import {Box, Grid2} from "@mui/material";
import {Info as AboutIcon} from "@mui/icons-material";
import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import style from "./About.module.css";
import {AboutText, AboutTextRu} from "./res/AboutText";
import Logo from "../assets/icons/valetudo_logo_with_name.svg?react";
import DetailPageHeaderRow from "../components/DetailPageHeaderRow";
import {useTranslation} from "react-i18next";
import i18n from "../i18n";

const About = (): React.ReactElement => {
    const {t} = useTranslation();
    const aboutText = i18n.language?.toLowerCase().startsWith("ru") ? AboutTextRu : AboutText;

    return (
        <PaperContainer>
            <Grid2 container direction="row">
                <Box style={{width: "100%"}}>
                    <DetailPageHeaderRow
                        title={t("about.title")}
                        icon={<AboutIcon/>}
                    />

                    <Grid2
                        style={{
                            padding: "1rem",
                            width: "80%",
                            marginLeft: "auto",
                            marginRight: "auto",
                            marginTop: "1rem",
                            textAlign: "center"
                        }}
                    >
                        <Logo
                            style={{
                                width: "100%"
                            }}
                        />
                    </Grid2>

                    <div className={style.reactMarkDown}>
                        <ReactMarkdown
                            remarkPlugins={[gfm]}
                            rehypePlugins={[rehypeRaw]}
                        >
                            {aboutText}
                        </ReactMarkdown>
                    </div>
                </Box>
            </Grid2>
        </PaperContainer>
    );
};

export default About;
