"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";


export default function Home() {
    const [textPrompt, setTextPrompt] = useState("");
    const [language, setLanguage] = useState("");
    const [voiceName, setVoiceName] = useState<string>("");
    const [availableVoices, setAvailableVoices] = useState<AvailableVoices | null>(null)
    const [fetching, setFetching] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null); // New state to store download URL

	useEffect(() => {
		const fetchAvailableVoices = async () => {
			console.log(`${process.env.NEXT_PUBLIC_API_DOMAIN}/available-voices`);
		  try {
			const response = await axios.get(`${process.env.NEXT_PUBLIC_API_DOMAIN}/available-voices`);
			setAvailableVoices(response.data);
			const defaultLanguage = Object.keys(response.data)[0];
			setLanguage(defaultLanguage);
			setVoiceName(response.data[defaultLanguage][0].value);
		  } catch (error) {
			console.error("Error fetching available voices:", error);
		  }
		};
	
		fetchAvailableVoices();
	  }, []);

	useEffect(() => {
		if (availableVoices && availableVoices[language]) {
			// Set the default voice name to the first item in the selected language
			setVoiceName(availableVoices[language][0]);
		}
	}, [language, availableVoices]);

    const handleOnClick = async () => {
        if (fetching) return;
        setFetching(true);
        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_API_DOMAIN}/generate-audio`,
				{
					text_prompt: textPrompt,
					language,
					voice_name: voiceName,
				},
				{ responseType: "blob" }
            );

			const url = window.URL.createObjectURL(new Blob([response.data]));
            setDownloadUrl(url); // Set the generated audio URL
        } catch (error) {
            console.error("Error generating audio:", error);
        } finally {
            setFetching(false);
        }
    };
	const handleDownload = () => {
        if (downloadUrl) {
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.setAttribute("download", "generated_audio.wav");
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div>
                <label>Text Prompt</label>
                <Input
                    type="text"
                    placeholder="Enter your text here"
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                />
            </div>

            <div>
                <label>Language</label>
                <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
						{availableVoices && Object.keys(availableVoices).map((voice) => 
							<SelectItem key={voice} value={voice}>
								{voice}
							</SelectItem>
						)}
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label>Voice Preset</label>
                <Select value={voiceName} onValueChange={setVoiceName}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select Voice Preset" />
                    </SelectTrigger>
					<SelectContent>
						{availableVoices && availableVoices[language]?.map((preset) => (
							<SelectItem key={preset} value={preset}>
								{preset}
							</SelectItem>
						))}
					</SelectContent>

                </Select>
            </div>

            <Button disabled={fetching} onClick={handleOnClick}>
                {fetching ? "Generating..." : "Generate Audio"}
            </Button>
			{downloadUrl && (
                <Button onClick={handleDownload} className="mt-4">
                    Download Audio
                </Button>
            )}
        </div>
    );
}


type AvailableVoices = {
	[language: string]: string[];
}