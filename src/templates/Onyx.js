import React, { memo, useEffect } from 'react';
import PageContext from '../contexts/PageContext';
import { useDispatch } from '../contexts/ResumeContext';
import AwardsA from './blocks/Awards/AwardsA';
import CertificationsA from './blocks/Certifications/CertificationsA';
import Contact from './blocks/Contact/ContactA';
import EducationA from './blocks/Education/EducationA';
import Heading from './blocks/Heading/HeadingA';
import HobbiesA from './blocks/Hobbies/HobbiesA';
import LanguagesA from './blocks/Languages/LanguagesA';
import ObjectiveA from './blocks/Objective/ObjectiveA';
import ProjectsA from './blocks/Projects/ProjectsA';
import ReferencesA from './blocks/References/ReferencesA';
import SkillsA from './blocks/Skills/SkillsA';
import WorkA from './blocks/Work/WorkA';

const Blocks = {
  objective: ObjectiveA,
  work: WorkA,
  education: EducationA,
  projects: ProjectsA,
  awards: AwardsA,
  certifications: CertificationsA,
  skills: SkillsA,
  hobbies: HobbiesA,
  languages: LanguagesA,
  references: ReferencesA,
};

const Onyx = ({ data }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'set_fixed_sections',
      payload: ['profile', 'social'],
    });
    dispatch({ type: 'set_block_count', payload: 3 });
  }, []);

  return (
    <PageContext.Provider value={{ data, heading: Heading }}>
      <div
        id="page"
        className="p-10 rounded"
        style={{
          fontFamily: data.metadata.font,
          color: data.metadata.colors.text,
          backgroundColor: data.metadata.colors.background,
        }}
      >
        <div className="grid grid-cols-4 items-center">
          <div className="col-span-3 flex items-center">
            {data.profile.photograph && (
              <img
                className="rounded object-cover mr-4"
                src={data.profile.photograph}
                alt="Resume Photograph"
                style={{ width: '120px', height: '120px' }}
              />
            )}

            <div>
              <h1
                className="font-bold text-4xl"
                style={{ color: data.metadata.colors.primary }}
              >
                {data.profile.firstName} {data.profile.lastName}
              </h1>
              <h6 className="font-medium text-sm">{data.profile.subtitle}</h6>

              <div className="flex flex-col mt-4 text-xs">
                <span>{data.profile.address.line1}</span>
                <span>{data.profile.address.line2}</span>
                <span>
                  {data.profile.address.city} {data.profile.address.pincode}
                </span>
              </div>
            </div>
          </div>

          <Contact />
        </div>

        <hr
          className="my-5 opacity-25"
          style={{ borderColor: data.metadata.colors.text }}
        />

        <div className="grid gap-4">
          {data.metadata.layout[0] &&
            data.metadata.layout[0].map((x) => {
              const Component = Blocks[x];
              return Component && <Component key={x} />;
            })}

          <div className="grid grid-cols-2 gap-4">
            {data.metadata.layout[1] &&
              data.metadata.layout[1].map((x) => {
                const Component = Blocks[x];
                return Component && <Component key={x} />;
              })}
          </div>

          {data.metadata.layout[2] &&
            data.metadata.layout[2].map((x) => {
              const Component = Blocks[x];
              return Component && <Component key={x} />;
            })}
        </div>
      </div>
    </PageContext.Provider>
  );
};

export default memo(Onyx);
